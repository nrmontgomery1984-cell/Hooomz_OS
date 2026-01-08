/**
 * Centralized logging utility
 *
 * In development: logs to console
 * In production: can be extended to send to monitoring service
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.info('User logged in', { userId: '123' });
 *   logger.error('Failed to fetch', error);
 *   logger.warn('Deprecated function called');
 *   logger.debug('Detailed debug info'); // Only in development
 */

const isDev = import.meta.env.DEV;
const isDebugEnabled = import.meta.env.VITE_DEBUG === 'true';

// Log levels
const LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Current log level (can be configured via env)
const currentLevel = isDev ? LEVELS.DEBUG : LEVELS.WARN;

function formatMessage(level, message, data) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  return { prefix, message, data };
}

function shouldLog(level) {
  return LEVELS[level] >= currentLevel;
}

export const logger = {
  debug(message, data) {
    if (shouldLog('DEBUG') && (isDev || isDebugEnabled)) {
      const { prefix } = formatMessage('DEBUG', message, data);
      if (data !== undefined) {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  },

  info(message, data) {
    if (shouldLog('INFO')) {
      const { prefix } = formatMessage('INFO', message, data);
      if (data !== undefined) {
        console.info(`${prefix} ${message}`, data);
      } else {
        console.info(`${prefix} ${message}`);
      }
    }
  },

  warn(message, data) {
    if (shouldLog('WARN')) {
      const { prefix } = formatMessage('WARN', message, data);
      if (data !== undefined) {
        console.warn(`${prefix} ${message}`, data);
      } else {
        console.warn(`${prefix} ${message}`);
      }
    }
  },

  error(message, error, data) {
    if (shouldLog('ERROR')) {
      const { prefix } = formatMessage('ERROR', message, data);
      console.error(`${prefix} ${message}`, error);
      if (data !== undefined) {
        console.error('Additional data:', data);
      }

      // In production, could send to error monitoring service
      // e.g., Sentry, LogRocket, etc.
      if (!isDev && typeof window !== 'undefined') {
        // Placeholder for error reporting service
        // window.errorReporter?.captureException(error, { extra: data });
      }
    }
  },

  // Group related logs together
  group(label, fn) {
    if (isDev) {
      console.group(label);
      try {
        fn();
      } finally {
        console.groupEnd();
      }
    } else {
      fn();
    }
  },

  // Time operations
  time(label) {
    if (isDev) {
      console.time(label);
    }
  },

  timeEnd(label) {
    if (isDev) {
      console.timeEnd(label);
    }
  },
};

export default logger;
