/**
 * Client-Side Authentication Cookie Manager
 * Handles setting, getting, and removing session cookies with a 1-week (7-day) TTL.
 * Manages authentic browser cookies for session persistence across all roles.
 */

const TOKEN_COOKIE_NAME = 'pc_token';
export const DEFAULT_SESSION_DAYS = 7; // 1 week session expiration

/**
 * Read the authentication token from browser cookies
 */
export function getAuthTokenCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + TOKEN_COOKIE_NAME + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Store the authentication token into browser cookies with a 7-day expiration
 */
export function setAuthTokenCookie(token: string, days: number = DEFAULT_SESSION_DAYS): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

/**
 * Remove the authentication token cookie on logout
 */
export function removeAuthTokenCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${TOKEN_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

/**
 * Check if the user has an active session cookie
 */
export function hasAuthCookie(): boolean {
  return Boolean(getAuthTokenCookie());
}
