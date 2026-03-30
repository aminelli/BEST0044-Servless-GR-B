import dotenv from 'dotenv';
import express, { Application, Request, Response} from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { uptime } from 'process';

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
    res.status(200).json({ 
        // Stato del server (sempre 'ok' se il server è in esecuzione)
        status: 'ok', 
        // Timestamp corrente in formato ISO 8601
        timestamp: new Date().toISOString(),
        // Tempo di attività del server in secondi 
        uptime: process.uptime() 
    });
});