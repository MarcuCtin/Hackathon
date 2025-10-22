import cron from 'node-cron';
import { logger } from '../config/logger.js';
import { aggregateDailyForUser } from '../services/insights.js';
import { User } from '../models/User.js';

export function scheduleDailyJobs(): void {
  // Run at 00:15 every day
  cron.schedule('15 0 * * *', async () => {
    logger.info('Daily cron started');
    const users = await User.find().select('_id').lean();
    const day = new Date();
    for (const u of users) {
      try {
        await aggregateDailyForUser(u._id.toString(), day);
      } catch (err) {
        logger.error({ err, userId: u._id }, 'Daily aggregation failed');
      }
    }
    logger.info('Daily cron finished');
  });
}
