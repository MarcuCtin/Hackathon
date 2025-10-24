import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { Log } from '../models/Log.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

const listQuery = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  type: z.string().optional(),
  limit: z
    .string()
    .transform((v) => Number(v))
    .pipe(z.number().int().positive())
    .optional(),
});

router.get(
  '/',
  requireAuth,
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { from, to, type, limit } = req.query as z.infer<typeof listQuery>;
    const q: Record<string, unknown> = { userId: new Types.ObjectId(req.userId) };
    if (from || to)
      q.date = { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) };
    if (type) q.type = type;
    const items = await Log.find(q)
      .sort({ date: -1 })
      .limit(limit ?? 100)
      .lean();
    void res.json({ success: true, data: items });
  }),
);

const createBody = z.object({
  type: z.enum(['workout', 'sleep', 'mood', 'hydration', 'steps', 'custom']),
  value: z.number(),
  unit: z.string().optional(),
  note: z.string().optional(),
  date: z.string().datetime(),
});

router.post(
  '/',
  requireAuth,
  validate({ body: createBody }),
  asyncHandler(async (req, res) => {
    const { type, value, unit, note, date } = req.body as z.infer<typeof createBody>;
    const created = await Log.create({
      userId: new Types.ObjectId(req.userId),
      type,
      value,
      unit,
      note,
      date: new Date(date),
    });
    void res.status(201).json({ success: true, data: created });
  }),
);

export default router;
