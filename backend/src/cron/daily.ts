import cron from 'node-cron';
import { logger } from '../config/logger.js';
import { aggregateDailyForUser } from '../services/insights.js';
import { User } from '../models/User.js';

export function scheduleDailyJobs(): void {
  // Run at 00:15 every day
  async function runDaily() {
    logger.info('Daily cron started');
    const users = await User.find().select('_id').lean();
    const day = new Date();
    for (const u of users) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        await aggregateDailyForUser(u._id.toString(), day);
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        logger.error({ err, userId: u._id.toString() }, 'Daily aggregation failed');
      }
    }
    logger.info('Daily cron finished');
  }

  cron.schedule('15 0 * * *', () => {
    void runDaily();
  });
}
