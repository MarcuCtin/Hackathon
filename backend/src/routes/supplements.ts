import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { Supplement } from '../models/Supplement.js';
import { SupplementLog } from '../models/SupplementLog.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

const createSupplementSchema = z.object({
  name: z.string().min(1),
  benefit: z.string().min(1),
  description: z.string().min(1),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  icon: z.string().optional(),
  category: z.enum(['recovery', 'immunity', 'energy', 'focus', 'heart', 'general']).optional(),
});

router.post(
  '/',
  requireAuth,
  validate({ body: createSupplementSchema }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof createSupplementSchema>;

    const supplement = await Supplement.create({
      userId: new Types.ObjectId(req.userId),
      ...data,
    });

    void res.status(201).json({ success: true, data: supplement });
  }),
);

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { addedToPlan, category } = req.query;
    const query: Record<string, unknown> = { userId: new Types.ObjectId(req.userId) };

    if (addedToPlan !== undefined) {
      query.addedToPlan = addedToPlan === 'true';
    }

    if (category) {
      query.category = category;
    }

    const supplements = await Supplement.find(query).sort({ createdAt: -1 }).lean();

    void res.json({ success: true, data: supplements });
  }),
);

router.patch(
  '/:id/add-to-plan',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const supplement = await Supplement.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(req.userId) },
      { addedToPlan: true },
      { new: true },
    );

    if (!supplement) {
      return void res.status(404).json({
        success: false,
        error: { message: 'Supplement not found' },
      });
    }

    void res.json({ success: true, data: supplement });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const supplement = await Supplement.findOneAndDelete({
      _id: id,
      userId: new Types.ObjectId(req.userId),
    });

    if (!supplement) {
      return void res.status(404).json({
        success: false,
        error: { message: 'Supplement not found' },
      });
    }

    void res.json({ success: true, data: supplement });
  }),
);

const logSupplementSchema = z.object({
  supplementId: z.string(),
  dosage: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().datetime().optional(),
});

router.post(
  '/log',
  requireAuth,
  validate({ body: logSupplementSchema }),
  asyncHandler(async (req, res) => {
    const { supplementId, dosage, notes, date } = req.body as z.infer<typeof logSupplementSchema>;

    const supplement = await Supplement.findOne({
      _id: supplementId,
      userId: new Types.ObjectId(req.userId),
    }).lean();

    if (!supplement) {
      return void res.status(404).json({
        success: false,
        error: { message: 'Supplement not found' },
      });
    }

    const logDate = date ? new Date(date) : new Date();

    const log = await SupplementLog.create({
      userId: new Types.ObjectId(req.userId),
      supplementId: new Types.ObjectId(supplementId),
      supplementName: supplement.name,
      date: logDate,
      dosage,
      notes,
    });

    void res.status(201).json({ success: true, data: log });
  }),
);

router.get(
  '/nutrition-analysis',
  requireAuth,
  asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nutritionLogs = await NutritionLog.find({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: today, $lt: tomorrow },
    }).lean();

    const supplementLogs = await SupplementLog.find({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: today, $lt: tomorrow },
    }).lean();

    const supplementIds = supplementLogs.map((log) => log.supplementId);
    const supplements = await Supplement.find({
      _id: { $in: supplementIds },
    }).lean();

    const supplementMicros: Record<string, number> = {};
    for (const sup of supplements) {
      if (sup.nutrients) {
        for (const [key, value] of Object.entries(sup.nutrients)) {
          if (typeof value === 'number') {
            supplementMicros[key] = (supplementMicros[key] || 0) + value;
          }
        }
      }
    }

    const foodMicros: Record<string, number> = {};
    for (const meal of nutritionLogs) {
      if (meal.micronutrients) {
        for (const [key, value] of Object.entries(meal.micronutrients)) {
          if (typeof value === 'number') {
            foodMicros[key] = (foodMicros[key] || 0) + value;
          }
        }
      }
    }

    const rda = {
      vitaminD: 15, // mcg
      calcium: 1000, // mg
      magnesium: 400, // mg
      iron: 18, // mg
      zinc: 11, // mg
      omega3: 1000, // mg
      b12: 2.4, // mcg
      folate: 400, // mcg
    };

    const analysis = [];
    for (const [nutrient, recommended] of Object.entries(rda)) {
      const fromFood = foodMicros[nutrient] || 0;
      const fromSupplements = supplementMicros[nutrient] || 0;
      const total = fromFood + fromSupplements;
      const percentage = (total / recommended) * 100;
      const deficiency = recommended - total;

      analysis.push({
        nutrient,
        recommended,
        fromFood,
        fromSupplements,
        total,
        percentage: Math.round(percentage),
        deficient: total < recommended,
        deficiencyGap: Math.max(0, deficiency),
      });
    }

    void res.json({
      success: true,
      data: {
        analysis,
        supplementsTaken: supplementLogs.map((log) => ({
          name: log.supplementName,
          dosage: log.dosage,
          timestamp: log.date,
        })),
      },
    });
  }),
);

export default router;
