import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import logger from '../utils/logger';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'customers_db',
    // waitForConnections: true consente al pool di attendere quando tutte le connessioni 
    // sono occupate, invece di restituire un errore immediatamente.
    waitForConnections: true,
    // connectionLimit imposta il numero massimo di connessioni da creare contemporaneamente.
    connectionLimit: 10,
    // queueLimit imposta il numero massimo di richieste di connessione che il pool metterà in coda 
    // prima di restituire un errore.
    queueLimit: 0,
    // enableKeepAlive: true consente al pool di mantenere attive le connessioni inattive, il che può
    // aiutare a migliorare le prestazioni riducendo il sovraccarico di stabilire nuove connessioni.
    enableKeepAlive: true,
    // keepAliveInitialDelay imposta il ritardo iniziale (in millisecondi) prima che il pool inizi 
    // a inviare pacchetti keep-alive alle connessioni inattive. 
    // Impostando questo valore a 0, il pool
    // inizierà a inviare pacchetti keep-alive immediatamente dopo che 
    // una connessione diventa inattiva.
    keepAliveInitialDelay: 0,
});

// Funzione per testare la connessione al database
export async function testConnection() : Promise<boolean> {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        logger.info('Database connection successful');
        return true;
    } catch (error) {
        logger.error('Database connection failed', error);
        return false;
    }
}

// Funzione per chiudere il pool di connessioni al database (Graceful shutdown) 
export async function closePool() : Promise<void> {
    try {
        await pool.end();
        logger.info('Database pool closed successfully');
    } catch (error) {
        logger.error('Error closing database pool', error);
    }
}

export default pool;