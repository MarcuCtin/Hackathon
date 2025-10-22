import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aggregateDailyForUser, getRecentInsights } from '../services/insights.js';

const router = Router();

const refreshQuery = z.object({ day: z.string().datetime().optional() });

router.post('/refresh', requireAuth, validate({ query: refreshQuery }), async (req, res, next) => {
  try {
    const dayStr = (req.query as z.infer<typeof refreshQuery>).day;
    const day = dayStr ? new Date(dayStr) : new Date();
    await aggregateDailyForUser(req.userId!, day);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const data = await getRecentInsights(req.userId!);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
