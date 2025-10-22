import mongoose from 'mongoose';
import { loadEnv } from '../config/env.js';
import { logger } from '../config/logger.js';

const env = loadEnv();

export async function connectMongo(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI);
  logger.info('MongoDB connected');
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
