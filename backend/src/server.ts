import { app } from '@/app.js';
import { env } from '@/config/env.js';

/**
 * Server Bootstrap & Process Lifecycle
 */
const server = app.listen(env.PORT, () => {
  console.log(`
  ======================================================
  🕉️  PujaCircle Backend Server Active
  📡  Listening at: http://localhost:${env.PORT}
  🚀  API Base URL: http://localhost:${env.PORT}/api/v1
  🌿  Environment:  ${env.NODE_ENV}
  ======================================================
  `);
});

const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Shutting down PujaCircle backend gracefully...`);
  server.close(() => {
    console.log('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forceful termination invoked after timeout.');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
