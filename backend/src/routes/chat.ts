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
});

router.get(
  '/messages',
  requireAuth,
  validate({ query: getMessagesQuery }),
  asyncHandler(async (req, res) => {
    const { sessionId, limit = 50 } = req.query as z.infer<typeof getMessagesQuery>;

    const query: Record<string, unknown> = { userId: req.userId };
    if (sessionId) {
      query.sessionId = sessionId;
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

export default router;
