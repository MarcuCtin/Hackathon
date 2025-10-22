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
  goals: z.array(z.string()).max(10).optional(),
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

export default router;
