import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const saveMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  sessionId: z.string().optional(),
});

router.post(
  '/save',
  requireAuth,
  validate({ body: saveMessageSchema }),
  asyncHandler(async (req, res) => {
    const { role, content, sessionId } = req.body as z.infer<typeof saveMessageSchema>;

    const message = await ChatMessage.create({
      userId: req.userId,
      role,
      content,
      sessionId: sessionId || `session_${Date.now()}`,
    });

    void res.status(201).json({ success: true, data: message });
  }),
);

const getMessagesQuery = z.object({
  sessionId: z.string().optional(),
  limit: z.string().transform(Number).optional(),
  day: z.string().optional(), // ISO date string for filtering by day
});

router.get(
  '/messages',
  requireAuth,
  validate({ query: getMessagesQuery }),
  asyncHandler(async (req, res) => {
    const { sessionId, limit = 50, day } = req.query as z.infer<typeof getMessagesQuery>;

    const query: Record<string, unknown> = { userId: req.userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    if (day) {
      const dayDate = new Date(day);
      const startOfDay = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      query.timestamp = {
        $gte: startOfDay,
        $lt: endOfDay,
      };
    }

    const messages = await ChatMessage.find(query).sort({ timestamp: -1 }).limit(limit).lean();

    void res.json({ success: true, data: messages.reverse() });
  }),
);

router.get(
  '/sessions',
  requireAuth,
  asyncHandler(async (req, res) => {
    const sessions = await ChatMessage.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$sessionId',
          lastMessage: { $max: '$timestamp' },
          messageCount: { $sum: 1 },
        },
      },
      { $sort: { lastMessage: -1 } },
      { $limit: 20 },
    ]);

    void res.json({ success: true, data: sessions });
  }),
);

router.get(
  '/messages/by-day',
  requireAuth,
  asyncHandler(async (req, res) => {
    const messages = await ChatMessage.find({ userId: req.userId }).sort({ timestamp: -1 }).lean();

    const messagesByDay: Record<string, unknown[]> = {};

    for (const message of messages) {
      const date = new Date(message.timestamp);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      if (dayKey && !messagesByDay[dayKey]) {
        messagesByDay[dayKey] = [];
      }

      if (dayKey) {
        messagesByDay[dayKey]!.push(message);
      }
    }

    const result = Object.entries(messagesByDay)
      .map(([day, msgs]) => ({
        day,
        messageCount: msgs.length,
        messages: msgs.reverse(), // Reverse to show oldest first for each day
      }))
      .sort((a, b) => new Date(b.day).getTime() - new Date(a.day).getTime());

    void res.json({ success: true, data: result });
  }),
);

export default router;
