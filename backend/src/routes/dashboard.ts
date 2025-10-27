import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Log } from '../models/Log.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { Suggestion } from '../models/Suggestion.js';
import { DailyTask } from '../models/DailyTask.js';
import { Achievement } from '../models/Achievement.js';
import { Supplement } from '../models/Supplement.js';
import { UserPlan } from '../models/UserPlan.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

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
      userId: new Types.ObjectId(req.userId),
      date: { $gte: today, $lt: tomorrow },
    }).lean();

    const nutritionLogs = await NutritionLog.find({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: today, $lt: tomorrow },
    }).lean();

    const chatMessages = await ChatMessage.find({
      userId: req.userId,
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // Get active suggestions
    const suggestions = await Suggestion.find({
      userId: req.userId,
      status: 'active',
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(5)
      .lean();

    // Get daily tasks
    let dailyTasks = await DailyTask.find({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: today, $lt: tomorrow },
    })
      .sort({ scheduledTime: 1 })
      .lean();

    // If no tasks exist, generate default tasks from active plan
    if (dailyTasks.length === 0) {
      const activePlan = await UserPlan.findOne({
        userId: new Types.ObjectId(req.userId),
        status: 'active',
      }).lean();

      if (activePlan) {
        dailyTasks = [
          {
            _id: new Types.ObjectId(),
            userId: new Types.ObjectId(req.userId),
            title: `Track ${activePlan.targetCalories} calories`,
            scheduledTime: '08:00',
            date: today,
            completed: false,
            category: 'nutrition',
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
          {
            _id: new Types.ObjectId(),
            userId: new Types.ObjectId(req.userId),
            title: `Reach ${activePlan.targetProtein}g protein`,
            scheduledTime: '12:00',
            date: today,
            completed: false,
            category: 'nutrition',
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
          {
            _id: new Types.ObjectId(),
            userId: new Types.ObjectId(req.userId),
            title:
              activePlan.planType === 'bulking' ? 'Strength training session' : 'Workout session',
            scheduledTime: '18:00',
            date: today,
            completed: false,
            category: 'exercise',
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
          {
            _id: new Types.ObjectId(),
            userId: new Types.ObjectId(req.userId),
            title: 'Drink 3L water',
            scheduledTime: '10:00',
            date: today,
            completed: false,
            category: 'wellness',
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
          {
            _id: new Types.ObjectId(),
            userId: new Types.ObjectId(req.userId),
            title: 'Sleep 7-8 hours',
            scheduledTime: '22:00',
            date: today,
            completed: false,
            category: 'wellness',
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
        ];
      }
    }

    // Get recent achievements
    const recentAchievements = await Achievement.find({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    // Get AI synced actions (from chat messages with actions)
    const aiSyncedActions = await ChatMessage.find({
      userId: req.userId,
      role: 'assistant',
      content: { $regex: /logged|synced/i },
    })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    // Get supplements
    const supplements = await Supplement.find({
      userId: new Types.ObjectId(req.userId),
      addedToPlan: true,
    })
      .sort({ createdAt: -1 })
      .limit(5)
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

    const totalCarbsToday = nutritionLogs.reduce((sum, meal) => sum + (meal.total?.carbs || 0), 0);

    const totalFatToday = nutritionLogs.reduce((sum, meal) => sum + (meal.total?.fat || 0), 0);

    // Get recent activities (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentLogs = await Log.find({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: weekAgo },
    })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    const recentNutrition = await NutritionLog.find({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: weekAgo },
    })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    // Calculate energy level based on sleep hours
    const calculateEnergyLevel = (sleepHours: number): number => {
      if (sleepHours >= 8) return 90 + Math.min(10, (sleepHours - 8) * 2);
      if (sleepHours >= 7) return 80 + (sleepHours - 7) * 10;
      if (sleepHours >= 6) return 60 + (sleepHours - 6) * 20;
      if (sleepHours >= 5) return 40 + (sleepHours - 5) * 20;
      return Math.max(20, sleepHours * 8);
    };

    // Calculate weekly energy data
    const weeklyEnergyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLogs = recentLogs.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= dayStart && logDate <= dayEnd;
      });

      const daySleep = dayLogs
        .filter((log) => log.type === 'sleep')
        .reduce((sum, log) => sum + (log.value || 0), 0);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      weeklyEnergyData.push({
        day: dayNames[date.getDay()],
        energy: calculateEnergyLevel(daySleep),
        sleep: daySleep,
      });
    }

    // Calculate nutrition targets and progress
    const nutritionTargets = {
      protein: 100,
      carbs: 150,
      fats: 70,
      water: 3,
    };

    const nutritionProgress = {
      protein: Math.min(100, (totalProteinToday / nutritionTargets.protein) * 100),
      carbs: Math.min(100, (totalCarbsToday / nutritionTargets.carbs) * 100),
      fats: Math.min(100, (totalFatToday / nutritionTargets.fats) * 100),
      water: Math.min(100, (hydrationToday / nutritionTargets.water) * 100),
    };

    const completedTasks = dailyTasks.filter((t) => t.completed).length;

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
          totalCarbs: totalCarbsToday,
          totalFat: totalFatToday,
          energyLevel: calculateEnergyLevel(sleepHoursToday),
        },
        dailyRoutine: {
          completed: completedTasks,
          total: dailyTasks.length,
          tasks: dailyTasks,
        },
        aiSyncedActions: aiSyncedActions,
        achievements: recentAchievements,
        supplements: supplements,
        recent: {
          logs: recentLogs,
          nutrition: recentNutrition,
          chatMessages: chatMessages.reverse(), // Show in chronological order
          suggestions: suggestions,
        },
        stats: {
          totalLogs: logs.length,
          totalNutrition: nutritionLogs.length,
          totalChatMessages: chatMessages.length,
          activeSuggestions: suggestions.length,
          completedTasks,
          totalTasks: dailyTasks.length,
        },
        analytics: {
          weeklyEnergy: weeklyEnergyData,
          nutritionTargets,
          nutritionProgress,
        },
      },
    });
  }),
);

// Get daily wellness data for a specific date
router.get(
  '/daily/:date',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { date } = req.params;
    if (!date) {
      return void res.status(400).json({
        success: false,
        error: { message: 'Date parameter is required' },
      });
    }
    const targetDate = new Date(date);

    if (isNaN(targetDate.getTime())) {
      return void res.status(400).json({
        success: false,
        error: { message: 'Invalid date format' },
      });
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch all data for the specific day
    const [logs, nutritionLogs, chatMessages] = await Promise.all([
      Log.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: startOfDay, $lt: endOfDay },
      }).lean(),
      NutritionLog.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: startOfDay, $lt: endOfDay },
      }).lean(),
      ChatMessage.find({
        userId: req.userId,
        timestamp: { $gte: startOfDay, $lt: endOfDay },
      }).lean(),
    ]);

    // Calculate daily totals
    const hydration = logs
      .filter((log) => log.type === 'hydration')
      .reduce((sum, log) => sum + (log.value || 0), 0);

    const workoutCalories = logs
      .filter((log) => log.type === 'workout')
      .reduce((sum, log) => sum + (log.value || 0), 0);

    const sleepHours = logs
      .filter((log) => log.type === 'sleep')
      .reduce((sum, log) => sum + (log.value || 0), 0);

    const totalCalories = nutritionLogs.reduce((sum, meal) => sum + (meal.total?.calories || 0), 0);

    const totalProtein = nutritionLogs.reduce((sum, meal) => sum + (meal.total?.protein || 0), 0);

    const totalCarbs = nutritionLogs.reduce((sum, meal) => sum + (meal.total?.carbs || 0), 0);

    const totalFat = nutritionLogs.reduce((sum, meal) => sum + (meal.total?.fat || 0), 0);

    // Calculate energy level based on sleep
    const calculateEnergyLevel = (sleepHours: number): number => {
      if (sleepHours >= 8) return 90 + Math.min(10, (sleepHours - 8) * 2);
      if (sleepHours >= 7) return 80 + (sleepHours - 7) * 10;
      if (sleepHours >= 6) return 60 + (sleepHours - 6) * 20;
      if (sleepHours >= 5) return 40 + (sleepHours - 5) * 20;
      return Math.max(20, sleepHours * 8);
    };

    // Group nutrition by meal type
    const mealsByType = {
      breakfast: nutritionLogs.filter((meal) => meal.mealType === 'breakfast'),
      lunch: nutritionLogs.filter((meal) => meal.mealType === 'lunch'),
      dinner: nutritionLogs.filter((meal) => meal.mealType === 'dinner'),
      snack: nutritionLogs.filter((meal) => meal.mealType === 'snack'),
    };

    // Calculate wellness score (0-100)
    const wellnessScore = Math.round(
      (Math.min(100, hydration * 10) + // Hydration: 10 points per glass, max 100
        Math.min(30, sleepHours * 4) + // Sleep: 4 points per hour, max 30
        Math.min(20, workoutCalories / 50) + // Exercise: 1 point per 50 calories, max 20
        Math.min(20, totalCalories / 50)) /
        1.7, // Nutrition: 1 point per 50 calories, max 20
    );

    void res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        wellness: {
          score: wellnessScore,
          energyLevel: calculateEnergyLevel(sleepHours),
          hydration,
          sleepHours,
        },
        movement: {
          workoutCalories,
          steps: logs
            .filter((log) => log.type === 'steps')
            .reduce((sum, log) => sum + (log.value || 0), 0),
          activeMinutes: 0, // Note field can store workout minutes
        },
        nutrition: {
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
          mealCount: nutritionLogs.length,
          mealsByType,
        },
        activities: logs.map((log) => ({
          id: log._id,
          type: log.type,
          value: log.value,
          unit: log.unit,
          note: log.note,
          timestamp: log.date,
        })),
        chatMessages: chatMessages.map((msg) => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        })),
      },
    });
  }),
);

export default router;
