/**
 * Simple mock delay helper for frontend development.
 * Simulates small network response time (~300ms - 500ms).
 */
export const delay = (ms: number = 400): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
