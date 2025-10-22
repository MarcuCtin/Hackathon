import pino from 'pino';
import { loadEnv } from './env.js';

const env = loadEnv();

export const logger = pino(
  env.NODE_ENV !== 'production'
    ? { level: env.LOG_LEVEL, transport: { target: 'pino-pretty' }, base: undefined }
    : { level: env.LOG_LEVEL, base: undefined },
);
