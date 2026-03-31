import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';


/**
 * Interfaccia per gli errori personalizzati
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware per la gestione centralizzata degli errori
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Se è un AppError personalizzato
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log dell'errore
  logger.error(`Error occurred: ${message}`, {
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Non esporre dettagli dell'errore in produzione se non operazionale
  if (process.env.NODE_ENV === 'production' && !isOperational) {
    message = 'An unexpected error occurred';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Middleware per gestire le route non trovate
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
