import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { Achievement } from '../models/Achievement.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

const createAchievementSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['nutrition', 'exercise', 'sleep', 'wellness', 'streak', 'milestone']),
  date: z.string().datetime(),
  icon: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  target: z.number().optional(),
});

router.post(
  '/',
  requireAuth,
  validate({ body: createAchievementSchema }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof createAchievementSchema>;

    const achievement = await Achievement.create({
      userId: new Types.ObjectId(req.userId),
      ...data,
      date: new Date(data.date),
    });

    void res.status(201).json({ success: true, data: achievement });
  }),
);

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { from, to, category } = req.query;
    const query: Record<string, unknown> = { userId: new Types.ObjectId(req.userId) };

    if (from || to) {
      query.date = {
        ...(from ? { $gte: new Date(from as string) } : {}),
        ...(to ? { $lte: new Date(to as string) } : {}),
      };
    }

    if (category) {
      query.category = category;
    }

    const achievements = await Achievement.find(query).sort({ date: -1 }).limit(100).lean();

    void res.json({ success: true, data: achievements });
  }),
);

router.get(
  '/weekly-summary',
  requireAuth,
  asyncHandler(async (req, res) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const achievements = await Achievement.find({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: weekAgo },
    })
      .sort({ date: -1 })
      .lean();

    void res.json({ success: true, data: achievements });
  }),
);

export default router;
