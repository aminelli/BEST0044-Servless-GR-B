import dotenv from 'dotenv';
import express, { Application, Request, Response} from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import logger from './utils/logger';
import { closePool, testConnection } from './config/database';

import customerRoutes from './routes/customers.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

// Crea un'applicazione Express (inizializza il server web  Express)
const app: Application = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// Middleware Start
// ===========================================

// Middleware per la sicurezza HTTP
app.use(
    helmet({
        // Disabilita la Content Security Policy per evitare problemi con alcune risorse esterne
        contentSecurityPolicy: false, 
    })
);

// CORS Middleware per consentire richieste da qualsiasi origine
app.use(
    cors({
        // Consente richieste da qualsiasi origine 
        // In Produzione, è consigliabile specificare l'URL del frontend invece di '*'
        origin: process.env.CORS_ORIGIN || '*', 
        // Consente i metodi HTTP specificati
        methods: ['GET', 'POST', 'PUT', 'DELETE'], 
        // Consente gli header specificati
        allowedHeaders: ['Content-Type', 'Authorization'], 
    })
);

// Middleware per la compressione delle risposte HTTP
app.use(compression());

// Middleware per il parsing del corpo delle richieste in formato JSON
app.use(express.json());   
// Per il parsing di form-urlencoded (utile per i form HTML)
app.use(express.urlencoded({ extended: true })); 

// Middleware per il rate limiting (limita il numero di richieste per IP)
// Rate limit configurato per consentire un massimo di 100 richieste ogni 15 minuti per IP
// In produzione, è consigliabile configurare il rate limit in modo più restrittivo per prevenire abusi (es. Redis)
const limiter = rateLimit({
    // 15 minuti
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15') * 60 * 1000,
    // Limite di 100 richieste per IP 
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    // Messaggio di risposta quando il limite viene superato
    message: 'Troppi tentativi da questo IP, riprova tra qualche minuto.',
    // Restituisce le intestazioni rate limit standard
    standardHeaders: true, 
    // Disabilita le intestazioni rate limit legacy
    legacyHeaders: false, 
});

// Applica il middleware di rate limiting a tutte le rotte che iniziano con /api/
app.use('/api/',limiter);


// ===========================================
// Gestione file statici (Asset di progetto)
// ===========================================

app.use(express.static(path.join(__dirname, 'public')));


// ===========================================
// Health Check Endpoint
// ===========================================


app.get('/health', (req: Request, res: Response) => {
    logger.info('Health check endpoint accessed', req.path);
    res.status(200).json({ 
        // Stato del server (sempre 'ok' se il server è in\ esecuzione)
        status: 'ok', 
        // Timestamp corrente in formato ISO 8601
        timestamp: new Date().toISOString(),
        // Tempo di attività del server in secondi 
        uptime: process.uptime() 
    });
});

app.get('/ready', async (req: Request, res: Response) => {
    logger.info('Readiness check endpoint accessed', req.path);
    const dbConnected = await testConnection();

    if (dbConnected) {
        res.status(200).json({ 
            status: 'ready', 
            database: 'connected' 
        });
    } else {
        res.status(503).json({ 
            status: 'not ready',
            database: 'disconnected'
        });

    }
});


// Importa e utilizza le rotte dell'API

app.use('/api/customers', customerRoutes);

// Static route per la home page (serve il file index.html)
app.get('/', (req: Request, res: Response) => {
    logger.info('Home Page accessed', req.path);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));     
});

// Error handling middleware per gestire errori
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, async () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Cloud Provider: ${process.env.CLOUD_PROVIDER || 'local'}`);

    const dbConnected = await testConnection();
    if (dbConnected) {
        logger.info('Database connection successful');
    } else {
        logger.warn('Database connection failed');
    }
});


// Graceful shuitdown (gestione chiusura del server in modo pulito)
const gracefulShutdown   = async  (signal: string) => {
    logger.info('Shutting down server gracefully...');
    logger.info(`Received signal: ${signal}`);
    
    server.close(async () => {
        logger.info('Server closed');

        try {
            await closePool();
            logger.info('Database pool closed');
            process.exit(0);
        } catch (error) {
            logger.error('Error during shutdown', error);
            process.exit(1);
        }
        
    });
    // Forza la chiusura del server dopo 10 secondi se non si chiude in modo pulito
    setTimeout(() => {  
        logger.error('Forcing server shutdown');
        process.exit(1);
    }, 10000);
};

// Gestisce i segnali di terminazione (es. Ctrl+C, kill)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestione errori non catturati
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Gestione promesse non gestite
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection: reason:', reason);    
});

export default app;