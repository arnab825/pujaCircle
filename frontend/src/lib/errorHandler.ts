/**
 * PujaCircle Centralized Error Handling & Safe Logging Service
 *
 * Principles:
 * 1. Users NEVER see raw database exceptions, stack traces, or internal file paths.
 * 2. Full error contexts and stack traces are safely logged server-side / console for development and production debugging.
 * 3. User-facing messages are guaranteed to be clean, actionable, and friendly.
 */

// Note: Do NOT use global /g flag with RegExp.prototype.test() to prevent lastIndex state bugs
const SENSITIVE_PATTERNS: RegExp[] = [
  /\/Users\/[^\s:]+/i,                    // Unix/Mac file paths
  /[C-Z]:\\[^\s:]+/i,                    // Windows file paths
  /\bat\s+[\w$./<>()[\]]+:\d+(:\d+)?/i,   // Stack trace frames (at function path:line:col)
  /\bat\s+eval\b/i,                       // Eval stack frames
  /\bfile:\/\//i,                         // file:// URI links
  /\b\w+\.(?:js|ts|tsx|jsx):\d+/i,        // Code file line pointers
  /\b(?:select|insert|update|delete|drop|table|sql|database|pg_|sqlite|mongo|mongodb)\b/i, // Raw DB keywords
  /\bnode_modules\b/i,
  /\berror:\s*uncaught\b/i,
  /\bTypeError:\b/i,
  /\bReferenceError:\b/i,
  /\bSyntaxError:\b/i,
];

/**
 * Strips internal paths, stack traces, and database jargon from an error message.
 */
export function sanitizeErrorMessage(
  rawMessage: string,
  defaultFallback: string = 'An unexpected error occurred. Please try again.'
): string {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return defaultFallback;
  }

  const trimmed = rawMessage.trim();

  // If the message contains any sensitive internals, reject it and return the safe fallback
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return defaultFallback;
    }
  }

  return trimmed || defaultFallback;
}

/**
 * Extracts a safe, friendly message from unknown error objects.
 */
export function getUserFriendlyErrorMessage(
  error: unknown,
  fallbackMessage: string = 'An unexpected error occurred. Please try again.'
): string {
  if (!error) return fallbackMessage;

  if (typeof error === 'string') {
    return sanitizeErrorMessage(error, fallbackMessage);
  }

  if (error instanceof Error) {
    return sanitizeErrorMessage(error.message, fallbackMessage);
  }

  if (typeof error === 'object' && 'message' in (error as Record<string, unknown>)) {
    const msg = String((error as Record<string, unknown>).message);
    return sanitizeErrorMessage(msg, fallbackMessage);
  }

  return fallbackMessage;
}

/**
 * Logs complete error details (including stack and metadata) server-side or to console
 * while keeping client UI clean.
 */
export function logAppError(
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const errorObj = error instanceof Error ? error : new Error(String(error));

  // Full detailed log for debugging
  console.error(`[AppError][${timestamp}][${context}]`, {
    message: errorObj.message,
    stack: errorObj.stack,
    metadata,
  });
}
