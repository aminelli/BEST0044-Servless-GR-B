/**
 * Logger utility per logging strutturato
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
    };
  }

  private output(logEntry: LogEntry): void {
    if (this.isDevelopment) {
      // In sviluppo: output colorato e leggibile
      const colors: { [key in LogLevel]: string } = {
        info: '\x1b[36m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
        debug: '\x1b[35m',
      };
      const reset = '\x1b[0m';
      console.log(
        `${colors[logEntry.level]}[${logEntry.level.toUpperCase()}]${reset} ${logEntry.timestamp} - ${logEntry.message}`,
        logEntry.data ? logEntry.data : ''
      );
    } else {
      // In produzione: JSON strutturato
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message: string, data?: any): void {
    this.output(this.formatLog('info', message, data));
  }

  warn(message: string, data?: any): void {
    this.output(this.formatLog('warn', message, data));
  }

  error(message: string, data?: any): void {
    this.output(this.formatLog('error', message, data));
  }

  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      this.output(this.formatLog('debug', message, data));
    }
  }
}

export default new Logger();
