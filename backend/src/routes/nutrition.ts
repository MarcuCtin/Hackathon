import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { NutritionLog } from '../models/NutritionLog.js';

const router = Router();

const logBody = z.object({
  date: z.string().datetime(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  items: z.array(
    z.object({
      name: z.string(),
      calories: z.number().nonnegative(),
      protein: z.number().nonnegative(),
      carbs: z.number().nonnegative(),
      fat: z.number().nonnegative(),
    }),
  ),
});

router.post('/log', requireAuth, validate({ body: logBody }), async (req, res, next) => {
  try {
    const { date, mealType, items } = req.body as z.infer<typeof logBody>;
    const total = items.reduce(
      (acc, it) => ({
        calories: acc.calories + it.calories,
        protein: acc.protein + it.protein,
        carbs: acc.carbs + it.carbs,
        fat: acc.fat + it.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
    const created = await NutritionLog.create({
      userId: req.userId,
      date: new Date(date),
      mealType,
      items,
      total,
    });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
});

const listQuery = z.object({
  day: z.string().datetime().optional(),
});

router.get('/list', requireAuth, validate({ query: listQuery }), async (req, res, next) => {
  try {
    const { day } = req.query as z.infer<typeof listQuery>;
    const q: Record<string, unknown> = { userId: req.userId };
    if (day) {
      const d = new Date(day);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      q.date = { $gte: start, $lt: end };
    }
    const items = await NutritionLog.find(q).sort({ date: -1 }).lean();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

export default router;
