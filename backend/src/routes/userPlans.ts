import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { UserPlan } from '../models/UserPlan.js';
import { UserTargets } from '../models/UserTargets.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

// Get active plan
router.get(
  '/active',
  requireAuth,
  asyncHandler(async (req, res) => {
    const activePlan = await UserPlan.findOne({
      userId: new Types.ObjectId(req.userId),
      status: 'active',
    })
      .sort({ startDate: -1 })
      .lean();

    void res.json({
      success: true,
      data: activePlan,
    });
  }),
);

// Get all plans (history)
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const plans = await UserPlan.find({
      userId: new Types.ObjectId(req.userId),
    })
      .sort({ startDate: -1 })
      .lean();

    void res.json({
      success: true,
      data: plans,
    });
  }),
);

// Get plan by ID
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const plan = await UserPlan.findOne({
      _id: req.params.id,
      userId: new Types.ObjectId(req.userId),
    }).lean();

    if (!plan) {
      return void res.status(404).json({
        success: false,
        error: { message: 'Plan not found' },
      });
    }

    void res.json({
      success: true,
      data: plan,
    });
  }),
);

// Create new plan
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      planType,
      planName,
      description,
      durationWeeks,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      primaryGoal,
      secondaryGoals,
      focusAreas,
      aiConversationHistory,
    } = req.body;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationWeeks * 7);

    // Deactivate any existing active plans
    await UserPlan.updateMany(
      {
        userId: new Types.ObjectId(req.userId),
        status: 'active',
      },
      {
        $set: { status: 'paused' },
      },
    );

    const newPlan = await UserPlan.create({
      userId: new Types.ObjectId(req.userId),
      planType,
      planName,
      description,
      durationWeeks,
      startDate,
      endDate,
      status: 'active',
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      primaryGoal,
      secondaryGoals,
      focusAreas,
      aiConversationHistory,
    });

    // Update UserTargets with plan targets
    await UserTargets.findOneAndUpdate(
      { userId: new Types.ObjectId(req.userId) },
      {
        $set: {
          calories: { target: targetCalories, current: 0 },
          protein: { target: targetProtein, current: 0 },
          carbs: { target: targetCarbs, current: 0 },
          fat: { target: targetFat, current: 0 },
          suggestedByAi: true,
          aiReason: `Part of ${planName}`,
        },
      },
      { upsert: true },
    );

    void res.json({
      success: true,
      data: newPlan,
    });
  }),
);

// Update plan status
router.patch(
  '/:id/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status } = req.body;

    const plan = await UserPlan.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: new Types.ObjectId(req.userId),
      },
      {
        $set: { status, updatedAt: new Date() },
      },
      { new: true },
    ).lean();

    if (!plan) {
      return void res.status(404).json({
        success: false,
        error: { message: 'Plan not found' },
      });
    }

    void res.json({
      success: true,
      data: plan,
    });
  }),
);

// Delete plan
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const plan = await UserPlan.findOneAndDelete({
      _id: req.params.id,
      userId: new Types.ObjectId(req.userId),
    });

    if (!plan) {
      return void res.status(404).json({
        success: false,
        error: { message: 'Plan not found' },
      });
    }

    void res.json({
      success: true,
      message: 'Plan deleted successfully',
    });
  }),
);

export default router;
