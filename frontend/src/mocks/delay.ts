import { config } from '@/lib/config';

/**
 * Simulates real-world network latency.
 * Defaults to config.mockDelayMs (350ms) to ensure smooth development while testing loading states.
 */
export const delay = (ms?: number): Promise<void> => {
  const duration = ms !== undefined ? ms : config.mockDelayMs;
  return new Promise((resolve) => setTimeout(resolve, duration));
};
