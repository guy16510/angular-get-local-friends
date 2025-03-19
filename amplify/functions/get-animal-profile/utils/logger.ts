// utils/logger.ts

/**
 * Simple logging utility for consistent log formatting
 */
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env['NODE_ENV'] !== 'production' || process.env['LOG_LEVEL'] === 'INFO') {
      console.log(JSON.stringify({
        level: 'INFO',
        message,
        timestamp: new Date().toISOString(),
        ...data && { data }
      }));
    }
  },
  
  warn: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'WARN',
      message,
      timestamp: new Date().toISOString(),
      ...data && { data }
    }));
  },
  
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      message,
      timestamp: new Date().toISOString(),
      ...(error instanceof Error) && { 
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      },
      ...error && !(error instanceof Error) && { data: error }
    }));
  }
};
