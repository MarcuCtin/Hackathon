import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aggregateDailyForUser, getRecentInsights } from '../services/insights.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const refreshQuery = z.object({ day: z.string().datetime().optional() });

router.post(
  '/refresh',
  requireAuth,
  validate({ query: refreshQuery }),
  asyncHandler(async (req, res) => {
    const dayStr = (req.query as z.infer<typeof refreshQuery>).day;
    const day = dayStr ? new Date(dayStr) : new Date();
    await aggregateDailyForUser(req.userId!, day);
    void res.json({ success: true });
  }),
);

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = await getRecentInsights(req.userId!);
    void res.json({ success: true, data });
  }),
);

export default router;
