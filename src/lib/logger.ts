type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
    [key: string]: unknown;
}

class Logger {
    private isProduction = process.env.NODE_ENV === 'production';

    private formatMessage(level: LogLevel, message: string, context?: LogContext) {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` | CONTEXT: ${JSON.stringify(context)}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
    }

    info(message: string, context?: LogContext) {
        const formatted = this.formatMessage('info', message, context);
        console.log(formatted);
        // In the future, we can send this to a service like Sentry or Axiom
    }

    warn(message: string, context?: LogContext) {
        const formatted = this.formatMessage('warn', message, context);
        console.warn(formatted);
    }

    error(message: string, error?: unknown, context?: LogContext) {
        const errorContext = {
            ...context,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
        };
        const formatted = this.formatMessage('error', message, errorContext);
        console.error(formatted);

        // Example: if (this.isProduction) Sentry.captureException(error);
    }

    debug(message: string, context?: LogContext) {
        if (!this.isProduction) {
            const formatted = this.formatMessage('debug', message, context);
            console.debug(formatted);
        }
    }
}

export const logger = new Logger();
