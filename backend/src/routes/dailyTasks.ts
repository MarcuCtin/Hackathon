import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { DailyTask } from '../models/DailyTask.js';
import { UserPlan } from '../models/UserPlan.js';
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
    const today = new Date();
    const targetDate = day ? new Date(day as string) : today;

    const startOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const tasks = await DailyTask.find({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: startOfDay, $lt: endOfDay },
    })
      .sort({ scheduledTime: 1 })
      .lean();

    const activePlan = await UserPlan.findOne({
      userId: new Types.ObjectId(req.userId),
      status: 'active',
    }).lean();

    const planTasks = [];
    if (activePlan && tasks.length === 0) {
      planTasks.push(
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(req.userId),
          title: `Track ${activePlan.targetCalories} calories`,
          scheduledTime: '08:00',
          date: startOfDay,
          completed: false,
          category: 'nutrition',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(req.userId),
          title: `Reach ${activePlan.targetProtein}g protein`,
          scheduledTime: '12:00',
          date: startOfDay,
          completed: false,
          category: 'nutrition',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(req.userId),
          title:
            activePlan.planType === 'bulking' ? 'Strength training session' : 'Workout session',
          scheduledTime: '18:00',
          date: startOfDay,
          completed: false,
          category: 'exercise',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(req.userId),
          title: 'Drink 3L water',
          scheduledTime: '10:00',
          date: startOfDay,
          completed: false,
          category: 'wellness',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(req.userId),
          title: 'Sleep 7-8 hours',
          scheduledTime: '22:00',
          date: startOfDay,
          completed: false,
          category: 'wellness',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
    }

    void res.json({ success: true, data: tasks.length > 0 ? tasks : planTasks });
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

router.post(
  '/generate-from-plan',
  requireAuth,
  asyncHandler(async (req, res) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const existingTasks = await DailyTask.find({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: startOfDay, $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000) },
    }).lean();

    if (existingTasks.length > 0) {
      return void res.json({
        success: true,
        message: 'Tasks already exist for today',
        data: existingTasks,
      });
    }

    const activePlan = await UserPlan.findOne({
      userId: new Types.ObjectId(req.userId),
      status: 'active',
    }).lean();

    if (!activePlan) {
      return void res.status(404).json({
        success: false,
        error: { message: 'No active plan found' },
      });
    }

    const tasksToCreate = [
      {
        userId: new Types.ObjectId(req.userId),
        title: `Track ${activePlan.targetCalories} calories`,
        scheduledTime: '08:00',
        date: startOfDay,
        completed: false,
        category: 'nutrition' as const,
      },
      {
        userId: new Types.ObjectId(req.userId),
        title: `Reach ${activePlan.targetProtein}g protein`,
        scheduledTime: '12:00',
        date: startOfDay,
        completed: false,
        category: 'nutrition' as const,
      },
      {
        userId: new Types.ObjectId(req.userId),
        title: activePlan.planType === 'bulking' ? 'Strength training session' : 'Workout session',
        scheduledTime: '18:00',
        date: startOfDay,
        completed: false,
        category: 'exercise' as const,
      },
      {
        userId: new Types.ObjectId(req.userId),
        title: 'Drink 3L water',
        scheduledTime: '10:00',
        date: startOfDay,
        completed: false,
        category: 'wellness' as const,
      },
      {
        userId: new Types.ObjectId(req.userId),
        title: 'Sleep 7-8 hours',
        scheduledTime: '22:00',
        date: startOfDay,
        completed: false,
        category: 'wellness' as const,
      },
    ];

    const createdTasks = await DailyTask.insertMany(tasksToCreate);

    void res.status(201).json({ success: true, data: createdTasks });
  }),
);

export default router;
