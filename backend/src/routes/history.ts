import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Log } from '../models/Log.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { Achievement } from '../models/Achievement.js';
import { DailyTask } from '../models/DailyTask.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

// Get weekly overview
router.get(
  '/weekly-overview',
  requireAuth,
  asyncHandler(async (req, res) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [logs, nutrition, achievements] = await Promise.all([
      Log.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: weekAgo },
      }).lean(),
      NutritionLog.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: weekAgo },
      }).lean(),
      Achievement.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: weekAgo },
      }).lean(),
    ]);

    // Calculate averages
    const avgCalories = nutrition.reduce((sum, n) => sum + (n.total?.calories || 0), 0) / 7;
    const avgProtein = nutrition.reduce((sum, n) => sum + (n.total?.protein || 0), 0) / 7;
    const avgSleep =
      logs.filter((l) => l.type === 'sleep').reduce((sum, l) => sum + (l.value || 0), 0) / 7;
    const workouts = logs.filter((l) => l.type === 'workout').length;
    const goalsHit = achievements.length;
    const streak = 7; // Calculate streak logic

    void res.json({
      success: true,
      data: {
        avgCalories: Math.round(avgCalories),
        avgProtein: Math.round(avgProtein),
        avgSleep: avgSleep.toFixed(1),
        workouts,
        goalsHit,
        streak,
        achievements: achievements.length,
      },
    });
  }),
);

// Get assistant timeline
router.get(
  '/assistant-timeline',
  requireAuth,
  asyncHandler(async (req, res) => {
    const aiMessages = await ChatMessage.find({
      userId: req.userId,
      role: 'assistant',
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    void res.json({ success: true, data: aiMessages });
  }),
);

// Get daily history with progress scores
router.get(
  '/daily-cards',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { days = 7 } = req.query;
    const daysBack = parseInt(days as string, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const [logs, nutrition, achievements] = await Promise.all([
      Log.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: startDate },
      }).lean(),
      NutritionLog.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: startDate },
      }).lean(),
      Achievement.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: startDate },
      }).lean(),
    ]);

    // Calculate wellness score for each day
    const calculateWellnessScore = (
      hydration: number,
      sleep: number,
      calories: number,
      workouts: number,
    ): number => {
      return Math.round(
        (Math.min(100, hydration * 10) +
          Math.min(30, sleep * 4) +
          Math.min(20, calories / 50) +
          Math.min(20, workouts * 2)) /
          1.7,
      );
    };

    const dailyCards = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLogs = logs.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= dayStart && logDate <= dayEnd;
      });

      const dayNutrition = nutrition.filter((meal) => {
        const mealDate = new Date(meal.date);
        return mealDate >= dayStart && mealDate <= dayEnd;
      });

      const hydration = dayLogs
        .filter((l) => l.type === 'hydration')
        .reduce((sum, l) => sum + (l.value || 0), 0);
      const sleep = dayLogs
        .filter((l) => l.type === 'sleep')
        .reduce((sum, l) => sum + (l.value || 0), 0);
      const calories = dayNutrition.reduce((sum, n) => sum + (n.total?.calories || 0), 0);
      const workouts = dayLogs.filter((l) => l.type === 'workout').length;
      const steps = dayLogs
        .filter((l) => l.type === 'steps')
        .reduce((sum, l) => sum + (l.value || 0), 0);

      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      dailyCards.push({
        date: date.toISOString().split('T')[0],
        displayDate: `${date.getDate()} ${dayNames[date.getDay()]} ${monthNames[date.getMonth()]} ${date.getFullYear()}`,
        dayOfWeek: dayNames[date.getDay()],
        progress: calculateWellnessScore(hydration, sleep, calories, workouts),
        hydration,
        sleep,
        calories,
        meals: dayNutrition.length,
        energyLevel: sleep >= 8 ? 90 : sleep >= 7 ? 80 : sleep >= 6 ? 60 : sleep >= 5 ? 40 : 20,
        steps,
      });
    }

    void res.json({ success: true, data: dailyCards });
  }),
);

// Get insights - progress comparisons
router.get(
  '/insights',
  requireAuth,
  asyncHandler(async (req, res) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const [currentWeekLogs, lastWeekLogs, currentWeekNutrition, lastWeekNutrition] =
      await Promise.all([
        Log.find({
          userId: new Types.ObjectId(req.userId),
          date: { $gte: weekAgo },
        }).lean(),
        Log.find({
          userId: new Types.ObjectId(req.userId),
          date: { $gte: twoWeeksAgo, $lt: weekAgo },
        }).lean(),
        NutritionLog.find({
          userId: new Types.ObjectId(req.userId),
          date: { $gte: weekAgo },
        }).lean(),
        NutritionLog.find({
          userId: new Types.ObjectId(req.userId),
          date: { $gte: twoWeeksAgo, $lt: weekAgo },
        }).lean(),
      ]);

    const currentSleep =
      currentWeekLogs
        .filter((l) => l.type === 'sleep')
        .reduce((sum, l) => sum + (l.value || 0), 0) / 7;
    const lastSleep =
      lastWeekLogs.filter((l) => l.type === 'sleep').reduce((sum, l) => sum + (l.value || 0), 0) /
      7;
    const sleepChange = lastSleep > 0 ? ((currentSleep - lastSleep) / lastSleep) * 100 : 0;

    const currentProtein =
      currentWeekNutrition.reduce((sum, n) => sum + (n.total?.protein || 0), 0) / 7;
    const lastProtein = lastWeekNutrition.reduce((sum, n) => sum + (n.total?.protein || 0), 0) / 7;
    const proteinChange =
      lastProtein > 0 ? ((currentProtein - lastProtein) / lastProtein) * 100 : 0;

    const currentWorkouts = currentWeekLogs.filter((l) => l.type === 'workout').length;
    const lastWorkouts = lastWeekLogs.filter((l) => l.type === 'workout').length;
    const workoutChange = currentWorkouts - lastWorkouts;

    void res.json({
      success: true,
      data: [
        {
          category: 'Sleep Quality',
          message: `Better rest compared to last week`,
          change: `+${Math.abs(sleepChange).toFixed(0)}%`,
          improved: sleepChange > 0,
        },
        {
          category: 'Protein Intake',
          message: `More consistent protein goals`,
          change: `+${Math.abs(proteinChange).toFixed(0)}%`,
          improved: proteinChange > 0,
        },
        {
          category: 'Workout Frequency',
          message: `Increased activity level`,
          change: `+${workoutChange} sessions`,
          improved: workoutChange > 0,
        },
      ],
    });
  }),
);

export default router;
