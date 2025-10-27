import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).lean();
    void res.json({ success: true, data: user });
  }),
);

const profileSchema = z.object({
  name: z.string().optional(),
  age: z.number().int().min(0).max(120).optional(),
  heightCm: z.number().min(50).max(300).optional(),
  weightKg: z.number().min(20).max(400).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  goals: z.array(z.string()).max(10).optional(),
  activityLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  onboardingAnswers: z.array(z.string()).max(50).optional(),
  completedOnboarding: z.boolean().optional(),
  identityComplete: z.boolean().optional(),
});

router.put(
  '/',
  requireAuth,
  validate({ body: profileSchema }),
  asyncHandler(async (req, res) => {
    const update = req.body as z.infer<typeof profileSchema>;
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).lean();
    void res.json({ success: true, data: user });
  }),
);

const onboardingSchema = z.object({
  onboardingAnswers: z.array(z.string()).min(1).max(50),
  identityComplete: z.boolean().optional(),
});

router.post(
  '/onboarding/complete',
  requireAuth,
  validate({ body: onboardingSchema }),
  asyncHandler(async (req, res) => {
    const { onboardingAnswers, identityComplete } = req.body as z.infer<typeof onboardingSchema>;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { onboardingAnswers, completedOnboarding: true, identityComplete: identityComplete ?? false },
      { new: true },
    ).lean();
    void res.json({ success: true, data: user });
  }),
);

export default router;
