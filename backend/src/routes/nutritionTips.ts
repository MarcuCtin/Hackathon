import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { NutritionTip } from '../models/NutritionTip.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

const createTipSchema = z.object({
  content: z.string().min(1),
  category: z.enum(['protein', 'calories', 'hydration', 'macros', 'general']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
});

router.post(
  '/',
  requireAuth,
  validate({ body: createTipSchema }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof createTipSchema>;

    const tip = await NutritionTip.create({
      userId: new Types.ObjectId(req.userId),
      ...data,
      date: new Date(),
    });

    void res.status(201).json({ success: true, data: tip });
  }),
);

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { seen, category } = req.query;
    const query: Record<string, unknown> = { userId: new Types.ObjectId(req.userId) };

    if (seen !== undefined) {
      query.seen = seen === 'true';
    }

    if (category) {
      query.category = category;
    }

    const tips = await NutritionTip.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(10)
      .lean();

    void res.json({ success: true, data: tips });
  }),
);

router.patch(
  '/:id/mark-seen',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const tip = await NutritionTip.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(req.userId) },
      { seen: true },
      { new: true },
    );

    if (!tip) {
      return void res.status(404).json({
        success: false,
        error: { message: 'Tip not found' },
      });
    }

    void res.json({ success: true, data: tip });
  }),
);

export default router;
