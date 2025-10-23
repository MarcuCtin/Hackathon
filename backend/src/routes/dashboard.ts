import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Log } from '../models/Log.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/data',
  requireAuth,
  asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's logs
    const logs = await Log.find({
      userId: req.userId,
      date: { $gte: today, $lt: tomorrow },
    }).lean();

    // Get today's nutrition logs
    const nutritionLogs = await NutritionLog.find({
      userId: req.userId,
      date: { $gte: today, $lt: tomorrow },
    }).lean();

    // Get recent chat messages (last 10)
    const chatMessages = await ChatMessage.find({
      userId: req.userId,
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // Calculate daily totals
    const hydrationToday = logs
      .filter((log) => log.type === 'hydration')
      .reduce((sum, log) => sum + (log.value || 0), 0);

    const workoutCaloriesToday = logs
      .filter((log) => log.type === 'workout')
      .reduce((sum, log) => sum + (log.value || 0), 0);

    const sleepHoursToday = logs
      .filter((log) => log.type === 'sleep')
      .reduce((sum, log) => sum + (log.value || 0), 0);

    const mealCountToday = nutritionLogs.length;

    const totalCaloriesToday = nutritionLogs.reduce(
      (sum, meal) => sum + (meal.total?.calories || 0),
      0,
    );

    const totalProteinToday = nutritionLogs.reduce(
      (sum, meal) => sum + (meal.total?.protein || 0),
      0,
    );

    // Get recent activities (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentLogs = await Log.find({
      userId: req.userId,
      date: { $gte: weekAgo },
    })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    const recentNutrition = await NutritionLog.find({
      userId: req.userId,
      date: { $gte: weekAgo },
    })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    void res.json({
      success: true,
      data: {
        daily: {
          hydration: hydrationToday,
          workoutCalories: workoutCaloriesToday,
          sleepHours: sleepHoursToday,
          mealCount: mealCountToday,
          totalCalories: totalCaloriesToday,
          totalProtein: totalProteinToday,
        },
        recent: {
          logs: recentLogs,
          nutrition: recentNutrition,
          chatMessages: chatMessages.reverse(), // Show in chronological order
        },
        stats: {
          totalLogs: logs.length,
          totalNutrition: nutritionLogs.length,
          totalChatMessages: chatMessages.length,
        },
      },
    });
  }),
);

export default router;
