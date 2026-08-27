import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response.js';

const SENSITIVE_SERVER_PATTERNS: RegExp[] = [
  /\/Users\/[^\s:]+/i,
  /\/home\/[^\s:]+/i,
  /[C-Z]:\\[^\s:]+/i,
  /\bat\s+[\w$./<>()[\]]+:\d+(:\d+)?/i,
  /\b(?:select|insert|update|delete|drop|table|database|pg_|sqlite|mongo|mongodb|prisma|knex|sequelize|typeorm|relation|column|syntax error at or near)\b/i,
  /\bnode_modules\b/i,
  /\bECONNREFUSED\b/i,
  /\bETIMEDOUT\b/i,
  /\bENOTFOUND\b/i,
  /\bTypeError\b/i,
  /\bReferenceError\b/i,
  /\bSyntaxError\b/i,
];

function sanitizeMessage(raw: string, fallback: string): string {
  if (!raw || typeof raw !== 'string') return fallback;
  for (const pattern of SENSITIVE_SERVER_PATTERNS) {
    if (pattern.test(raw)) {
      return fallback;
    }
  }
  return raw.trim() || fallback;
}

/**
 * Global Error Handling Middleware
 * - Logs full stack traces server-side for debugging
 * - Returns safe, sanitized, user-friendly error messages to clients without leaking DB/ORM internals
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;

  // Always log full error trace on server for internal telemetry & debugging
  console.error(`[SERVER_ERROR] [${new Date().toISOString()}] [${req.method}] ${req.originalUrl}:`, {
    status: statusCode,
    message: err.message,
    stack: err.stack,
    errors: err.errors,
  });

  // If operational client error (4xx), return specific sanitized message
  if (statusCode >= 400 && statusCode < 500) {
    const clientMessage = sanitizeMessage(err.message, 'Invalid request. Please check your inputs.');
    return ApiResponse.error(res, clientMessage, statusCode, err.errors || null);
  }

  // If internal server error (500), return generic message to prevent leaking SQL / table names
  const genericServerMessage = 'An unexpected internal server error occurred. Please try again later.';
  return ApiResponse.error(res, genericServerMessage, 500, null);
};

