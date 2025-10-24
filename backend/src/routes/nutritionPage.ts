import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { Log } from '../models/Log.js';
import { Supplement } from '../models/Supplement.js';
import { NutritionTip } from '../models/NutritionTip.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

// Get today's nutrition summary
router.get(
  '/today',
  requireAuth,
  asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [nutritionLogs, hydrationLogs] = await Promise.all([
      NutritionLog.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: today, $lt: tomorrow },
      }).lean(),
      Log.find({
        userId: new Types.ObjectId(req.userId),
        type: 'hydration',
        date: { $gte: today, $lt: tomorrow },
      }).lean(),
    ]);

    const totalCalories = nutritionLogs.reduce((sum, n) => sum + (n.total?.calories || 0), 0);
    const totalProtein = nutritionLogs.reduce((sum, n) => sum + (n.total?.protein || 0), 0);
    const totalCarbs = nutritionLogs.reduce((sum, n) => sum + (n.total?.carbs || 0), 0);
    const totalFat = nutritionLogs.reduce((sum, n) => sum + (n.total?.fat || 0), 0);
    const water = hydrationLogs.reduce((sum, l) => sum + (l.value || 0), 0);
    const caffeine = 180; // Mock caffeine value - can be tracked via custom log type

    // Group meals by type
    const mealsByType = {
      breakfast: nutritionLogs.filter((m) => m.mealType === 'breakfast'),
      lunch: nutritionLogs.filter((m) => m.mealType === 'lunch'),
      dinner: nutritionLogs.filter((m) => m.mealType === 'dinner'),
      snack: nutritionLogs.filter((m) => m.mealType === 'snack'),
    };

    void res.json({
      success: true,
      data: {
        calories: {
          current: totalCalories,
          target: 2200,
          remaining: Math.max(0, 2200 - totalCalories),
        },
        protein: { current: totalProtein, target: 120 },
        carbs: { current: totalCarbs, target: 150 },
        fat: { current: totalFat, target: 70 },
        water: { current: water, target: 3 },
        caffeine: { current: caffeine, target: 300 },
        meals: nutritionLogs,
        mealsByType,
      },
    });
  }),
);

// Get recommended supplements
router.get(
  '/supplements',
  requireAuth,
  asyncHandler(async (req, res) => {
    const supplements = await Supplement.find({
      userId: new Types.ObjectId(req.userId),
    })
      .sort({ createdAt: -1 })
      .lean();

    void res.json({ success: true, data: supplements });
  }),
);

// Get nutrition tips
router.get(
  '/tips',
  requireAuth,
  asyncHandler(async (req, res) => {
    const tip = await NutritionTip.findOne({
      userId: new Types.ObjectId(req.userId),
      seen: false,
    })
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    void res.json({ success: true, data: tip || null });
  }),
);

export default router;
