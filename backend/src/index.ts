import 'dotenv/config';
import { createApp } from './app.js';
import { connectMongo } from './db/mongoose.js';
import { loadEnv } from './config/env.js';
import { logger } from './config/logger.js';
import { scheduleDailyJobs } from './cron/daily.js';

async function main() {
  const env = loadEnv();
  await connectMongo();
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on :${env.PORT}`);
  });

  scheduleDailyJobs();

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const sig of signals) {
    process.on(sig, () => {
      logger.info({ sig }, 'Shutting down');
      server.close(() => process.exit(0));
    });
  }
}

void main();
