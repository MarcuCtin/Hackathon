import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { Log } from '../models/Log.js';
import { Supplement } from '../models/Supplement.js';
import { SupplementLog } from '../models/SupplementLog.js';
import { NutritionTip } from '../models/NutritionTip.js';
import { UserTargets } from '../models/UserTargets.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

router.get(
  '/today',
  requireAuth,
  asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [nutritionLogs, hydrationLogs, caffeineLogs] = await Promise.all([
      NutritionLog.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: today, $lt: tomorrow },
      }).lean(),
      Log.find({
        userId: new Types.ObjectId(req.userId),
        type: 'hydration',
        date: { $gte: today, $lt: tomorrow },
      }).lean(),
      Log.find({
        userId: new Types.ObjectId(req.userId),
        $or: [{ type: 'caffeine' }, { type: 'custom', note: { $regex: /caffeine|coffee/i } }],
        date: { $gte: today, $lt: tomorrow },
      }).lean(),
    ]);

    const totalCalories = nutritionLogs.reduce((sum, n) => sum + (n.total?.calories || 0), 0);
    const totalProtein = nutritionLogs.reduce((sum, n) => sum + (n.total?.protein || 0), 0);
    const totalCarbs = nutritionLogs.reduce((sum, n) => sum + (n.total?.carbs || 0), 0);
    const totalFat = nutritionLogs.reduce((sum, n) => sum + (n.total?.fat || 0), 0);
    const waterInGlasses = hydrationLogs.reduce((sum, l) => sum + (l.value || 0), 0);
    const water = waterInGlasses * 0.2; // Convert glasses to liters
    const caffeine = caffeineLogs.reduce((sum, l) => sum + (l.value || 0), 0);

    const foodMicronutrients = {
      vitaminD: 0,
      calcium: 0,
      magnesium: 0,
      iron: 0,
      zinc: 0,
      omega3: 0,
      b12: 0,
      folate: 0,
    };

    for (const meal of nutritionLogs) {
      if (meal.micronutrients) {
        foodMicronutrients.vitaminD += meal.micronutrients.vitaminD || 0;
        foodMicronutrients.calcium += meal.micronutrients.calcium || 0;
        foodMicronutrients.magnesium += meal.micronutrients.magnesium || 0;
        foodMicronutrients.iron += meal.micronutrients.iron || 0;
        foodMicronutrients.zinc += meal.micronutrients.zinc || 0;
        foodMicronutrients.omega3 += meal.micronutrients.omega3 || 0;
        foodMicronutrients.b12 += meal.micronutrients.b12 || 0;
        foodMicronutrients.folate += meal.micronutrients.folate || 0;
      }
    }

    const supplementLogs = await SupplementLog.find({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: today, $lt: tomorrow },
    }).lean();

    const supplementMicronutrients = {
      vitaminD: 0,
      calcium: 0,
      magnesium: 0,
      iron: 0,
      zinc: 0,
      omega3: 0,
      b12: 0,
      folate: 0,
    };

    for (const suppLog of supplementLogs) {
      const supplement = await Supplement.findById(suppLog.supplementId).lean();
      if (supplement?.nutrients) {
        supplementMicronutrients.vitaminD += supplement.nutrients.vitaminD || 0;
        supplementMicronutrients.calcium += supplement.nutrients.calcium || 0;
        supplementMicronutrients.magnesium += supplement.nutrients.magnesium || 0;
        supplementMicronutrients.iron += supplement.nutrients.iron || 0;
        supplementMicronutrients.zinc += supplement.nutrients.zinc || 0;
        supplementMicronutrients.omega3 += supplement.nutrients.omega3 || 0;
        supplementMicronutrients.b12 += supplement.nutrients.b12 || 0;
        supplementMicronutrients.folate += supplement.nutrients.folate || 0;
      }
    }

    const totalMicronutrients = {
      vitaminD: foodMicronutrients.vitaminD + supplementMicronutrients.vitaminD,
      calcium: foodMicronutrients.calcium + supplementMicronutrients.calcium,
      magnesium: foodMicronutrients.magnesium + supplementMicronutrients.magnesium,
      iron: foodMicronutrients.iron + supplementMicronutrients.iron,
      zinc: foodMicronutrients.zinc + supplementMicronutrients.zinc,
      omega3: foodMicronutrients.omega3 + supplementMicronutrients.omega3,
      b12: foodMicronutrients.b12 + supplementMicronutrients.b12,
      folate: foodMicronutrients.folate + supplementMicronutrients.folate,
    };

    let userTargets = await UserTargets.findOne({
      userId: new Types.ObjectId(req.userId),
    }).lean();

    if (!userTargets) {
      const newTargets = await UserTargets.create({
        userId: new Types.ObjectId(req.userId),
        calories: { target: 2000, current: totalCalories },
        protein: { target: 120, current: totalProtein },
        carbs: { target: 250, current: totalCarbs },
        fat: { target: 70, current: totalFat },
        vitaminD: { target: 15, current: totalMicronutrients.vitaminD },
        calcium: { target: 1000, current: totalMicronutrients.calcium },
        magnesium: { target: 400, current: totalMicronutrients.magnesium },
        iron: { target: 18, current: totalMicronutrients.iron },
        zinc: { target: 11, current: totalMicronutrients.zinc },
        omega3: { target: 1000, current: totalMicronutrients.omega3 },
        b12: { target: 2.4, current: totalMicronutrients.b12 },
        folate: { target: 400, current: totalMicronutrients.folate },
        water: { target: 3, current: water },
        caffeine: { target: 300, current: caffeine },
        suggestedByAi: false,
      });
      userTargets = newTargets.toObject() as typeof userTargets & { __v: number };
    } else {
      await UserTargets.findOneAndUpdate(
        { userId: new Types.ObjectId(req.userId) },
        {
          $set: {
            'calories.current': totalCalories,
            'protein.current': totalProtein,
            'carbs.current': totalCarbs,
            'fat.current': totalFat,
            'water.current': water,
            'caffeine.current': caffeine,
            'vitaminD.current': totalMicronutrients.vitaminD,
            'calcium.current': totalMicronutrients.calcium,
            'magnesium.current': totalMicronutrients.magnesium,
            'iron.current': totalMicronutrients.iron,
            'zinc.current': totalMicronutrients.zinc,
            'omega3.current': totalMicronutrients.omega3,
            'b12.current': totalMicronutrients.b12,
            'folate.current': totalMicronutrients.folate,
            updatedAt: new Date(),
          },
        },
      );

      userTargets = await UserTargets.findOne({
        userId: new Types.ObjectId(req.userId),
      }).lean();
    }

    if (!userTargets) {
      throw new Error('Failed to get or create user targets');
    }

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
          target: userTargets.calories.target,
          remaining: Math.max(0, userTargets.calories.target - totalCalories),
        },
        protein: { current: totalProtein, target: userTargets.protein.target },
        carbs: { current: totalCarbs, target: userTargets.carbs.target },
        fat: { current: totalFat, target: userTargets.fat.target },
        water: { current: water, target: userTargets.water.target },
        caffeine: { current: caffeine, target: userTargets.caffeine.target },
        micronutrients: {
          vitaminD: {
            current: totalMicronutrients.vitaminD,
            target: userTargets.vitaminD.target,
            fromFood: foodMicronutrients.vitaminD,
            fromSupplements: supplementMicronutrients.vitaminD,
          },
          calcium: {
            current: totalMicronutrients.calcium,
            target: userTargets.calcium.target,
            fromFood: foodMicronutrients.calcium,
            fromSupplements: supplementMicronutrients.calcium,
          },
          magnesium: {
            current: totalMicronutrients.magnesium,
            target: userTargets.magnesium.target,
            fromFood: foodMicronutrients.magnesium,
            fromSupplements: supplementMicronutrients.magnesium,
          },
          iron: {
            current: totalMicronutrients.iron,
            target: userTargets.iron.target,
            fromFood: foodMicronutrients.iron,
            fromSupplements: supplementMicronutrients.iron,
          },
          zinc: {
            current: totalMicronutrients.zinc,
            target: userTargets.zinc.target,
            fromFood: foodMicronutrients.zinc,
            fromSupplements: supplementMicronutrients.zinc,
          },
          omega3: {
            current: totalMicronutrients.omega3,
            target: userTargets.omega3.target,
            fromFood: foodMicronutrients.omega3,
            fromSupplements: supplementMicronutrients.omega3,
          },
          b12: {
            current: totalMicronutrients.b12,
            target: userTargets.b12.target,
            fromFood: foodMicronutrients.b12,
            fromSupplements: supplementMicronutrients.b12,
          },
          folate: {
            current: totalMicronutrients.folate,
            target: userTargets.folate.target,
            fromFood: foodMicronutrients.folate,
            fromSupplements: supplementMicronutrients.folate,
          },
        },
        meals: nutritionLogs,
        mealsByType,
      },
    });
  }),
);

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
