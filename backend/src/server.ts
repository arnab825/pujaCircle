import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`PujaCircle API Scaffolding server running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
});
