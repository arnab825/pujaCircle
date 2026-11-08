import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../views/response.view.js';
import { AppError } from '../utils/AppError.js';

/**
 * Checks whether an error message is safe to present to end-users without
 * leaking stack traces, internal filesystem paths, or raw database query syntax.
 */
function isSafeClientMessage(message: unknown): boolean {
  if (typeof message !== 'string') return false;
  const lower = message.toLowerCase();
  if (
    lower.includes('syntax error') ||
    lower.includes('pg_') ||
    lower.includes('relation "') ||
    lower.includes('column "') ||
    lower.includes('select ') ||
    lower.includes('insert into') ||
    lower.includes('update ') ||
    lower.includes('delete from') ||
    lower.includes('d:\\') ||
    lower.includes('c:\\') ||
    lower.includes('/node_modules') ||
    lower.includes('\\node_modules') ||
    lower.includes('.ts:') ||
    lower.includes('.js:')
  ) {
    return false;
  }
  return true;
}

/**
 * [MIDDLEWARE] Global Error Handler
 * Sanitizes errors — strictly prevents stack traces, DB internals, or file paths from leaking to clients.
 * Full technical details are logged server-side for debugging.
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Always log full error server-side for observability and debugging
  console.error('[SERVER ERROR DETAIL]:', err);

  // Zod validation errors — return clean field-level messages to the client
  if (err instanceof ZodError) {
    const issue = err.issues[0];
    const message = issue ? `${issue.path.join('.') || 'input'}: ${issue.message}` : 'Validation failed';
    const cleanErrors = err.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    sendError(res, message, 400, cleanErrors);
    return;
  }

  // AppError — typed operational errors with safe status code
  if (err instanceof AppError && err.statusCode < 500) {
    const safeMessage = isSafeClientMessage(err.message)
      ? err.message
      : 'The requested operation could not be completed.';
    sendError(res, safeMessage, err.statusCode);
    return;
  }

  // Legacy plain-object errors { statusCode, message }
  if (err.statusCode && typeof err.statusCode === 'number' && err.statusCode < 500) {
    const safeMessage = isSafeClientMessage(err.message)
      ? err.message
      : 'The requested operation could not be completed.';
    sendError(res, safeMessage, err.statusCode);
    return;
  }

  // Fallback for unexpected 500 errors — never expose raw DB internals or stack traces
  sendError(res, 'An unexpected server error occurred. Please try again.', 500);
};
