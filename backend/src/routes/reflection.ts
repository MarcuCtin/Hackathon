import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { Reflection } from '../models/Reflection.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

// Get today's reflection
router.get(
  '/today',
  requireAuth,
  asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reflection = await Reflection.findOne({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: today, $lt: tomorrow },
    }).lean();

    void res.json({ success: true, data: reflection || null });
  }),
);

// Create or update today's reflection
const createBody = z.object({
  mood: z.enum([
    'calm',
    'stressed',
    'focused',
    'energized',
    'tired',
    'motivated',
    'anxious',
    'content',
  ]),
  energyLevel: z.number().min(0).max(100),
  stressLevel: z.number().min(0).max(100),
  sleepQuality: z.enum(['excellent', 'good', 'fair', 'poor']),
  notes: z.string().max(500).optional(),
});

router.post(
  '/',
  requireAuth,
  validate({ body: createBody }),
  asyncHandler(async (req, res) => {
    const { mood, energyLevel, stressLevel, sleepQuality, notes } = req.body as z.infer<
      typeof createBody
    >;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find existing reflection for today
    const existing = await Reflection.findOne({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (existing) {
      // Update existing reflection
      const updated = await Reflection.findByIdAndUpdate(
        existing._id,
        {
          mood,
          energyLevel,
          stressLevel,
          sleepQuality,
          notes,
        },
        { new: true },
      ).lean();

      void res.json({ success: true, data: updated });
    } else {
      // Create new reflection
      const reflection = await Reflection.create({
        userId: new Types.ObjectId(req.userId),
        date: today,
        mood,
        energyLevel,
        stressLevel,
        sleepQuality,
        notes,
      });

      void res.status(201).json({ success: true, data: reflection });
    }
  }),
);

// Get reflection for a specific date
router.get(
  '/:date',
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
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const reflection = await Reflection.findOne({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: targetDate, $lt: nextDay },
    }).lean();

    void res.json({ success: true, data: reflection || null });
  }),
);

// Get recent reflections (last 7 days)
router.get(
  '/recent/last-week',
  requireAuth,
  asyncHandler(async (req, res) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const reflections = await Reflection.find({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: weekAgo },
    })
      .sort({ date: -1 })
      .lean();

    void res.json({ success: true, data: reflections });
  }),
);

export default router;
