/**
 * Application Runtime Configuration
 * Safe for both Vite client runtime and Node test runners.
 */

const getEnv = (key: string, defaultValue: string = ''): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

export const config = {
  apiBaseUrl: getEnv('VITE_API_BASE_URL', 'http://localhost:5000/api/v1'),
  mockDelayMs: Number(getEnv('VITE_MOCK_DELAY_MS', '50')), // Low latency for fast CLI tests, configurable
  isMockEnabled: true,
  defaultTimeout: 10000,
};
