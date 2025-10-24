import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { UserTargets } from '../models/UserTargets.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

// Get user targets
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    let userTargets = await UserTargets.findOne({
      userId: new Types.ObjectId(req.userId),
    }).lean();

    // If no targets exist, create default ones
    if (!userTargets) {
      const newTargets = await UserTargets.create({
        userId: new Types.ObjectId(req.userId),
      });
      userTargets = await UserTargets.findById(newTargets._id).lean();
    }

    void res.json({
      success: true,
      data: userTargets,
    });
  }),
);

// Update user targets
router.put(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const updates = req.body;

    const userTargets = await UserTargets.findOneAndUpdate(
      { userId: new Types.ObjectId(req.userId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { new: true, upsert: true },
    ).lean();

    void res.json({
      success: true,
      data: userTargets,
    });
  }),
);

// Approve AI suggested targets
router.post(
  '/approve-ai-targets',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { targets } = req.body;

    const userTargets = await UserTargets.findOneAndUpdate(
      { userId: new Types.ObjectId(req.userId) },
      {
        $set: {
          calories: { target: targets.calories, current: 0 },
          protein: { target: targets.protein, current: 0 },
          carbs: { target: targets.carbs, current: 0 },
          fat: { target: targets.fat, current: 0 },
          vitaminD: { target: targets.vitaminD, current: 0 },
          calcium: { target: targets.calcium, current: 0 },
          magnesium: { target: targets.magnesium, current: 0 },
          iron: { target: targets.iron, current: 0 },
          zinc: { target: targets.zinc, current: 0 },
          omega3: { target: targets.omega3, current: 0 },
          b12: { target: targets.b12, current: 0 },
          folate: { target: targets.folate, current: 0 },
          water: { target: targets.water, current: 0 },
          caffeine: { target: targets.caffeine, current: 0 },
          suggestedByAi: true,
          aiReason: targets.reason,
          updatedAt: new Date(),
        },
      },
      { new: true, upsert: true },
    ).lean();

    void res.json({
      success: true,
      data: userTargets,
    });
  }),
);

export default router;
