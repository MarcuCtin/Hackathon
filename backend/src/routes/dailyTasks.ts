import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { DailyTask } from '../models/DailyTask.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/),
  date: z.string().datetime(),
  category: z.enum(['wellness', 'nutrition', 'exercise', 'supplements', 'custom']).optional(),
});

router.post(
  '/',
  requireAuth,
  validate({ body: createTaskSchema }),
  asyncHandler(async (req, res) => {
    const { title, scheduledTime, date, category } = req.body as z.infer<typeof createTaskSchema>;

    const task = await DailyTask.create({
      userId: new Types.ObjectId(req.userId),
      title,
      scheduledTime,
      date: new Date(date),
      category: category || 'custom',
    });

    void res.status(201).json({ success: true, data: task });
  }),
);

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { day } = req.query;
    const query: Record<string, unknown> = { userId: new Types.ObjectId(req.userId) };

    if (day) {
      const dayDate = new Date(day as string);
      const startOfDay = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      query.date = { $gte: startOfDay, $lt: endOfDay };
    }

    const tasks = await DailyTask.find(query).sort({ scheduledTime: 1 }).lean();

    void res.json({ success: true, data: tasks });
  }),
);

router.patch(
  '/:id/complete',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body as { completed: boolean };

    const task = await DailyTask.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(req.userId) },
      { completed, completedAt: completed ? new Date() : undefined },
      { new: true },
    );

    if (!task) {
      return void res.status(404).json({
        success: false,
        error: { message: 'Task not found' },
      });
    }

    void res.json({ success: true, data: task });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await DailyTask.findOneAndDelete({
      _id: id,
      userId: new Types.ObjectId(req.userId),
    });

    if (!task) {
      return void res.status(404).json({
        success: false,
        error: { message: 'Task not found' },
      });
    }

    void res.json({ success: true, data: task });
  }),
);

export default router;
