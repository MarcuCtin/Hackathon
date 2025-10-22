import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { chatWithAi } from '../services/openai.js';

const router = Router();

const chatBody = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    }),
  ),
});

router.post('/chat', requireAuth, validate({ body: chatBody }), async (req, res, next) => {
  try {
    const { messages } = req.body as z.infer<typeof chatBody>;
    const system = {
      role: 'system' as const,
      content:
        'You are Fitter, an AI Lifestyle Coach. Provide actionable, safe, and empathetic guidance aligned with user goals. Keep answers concise and practical.',
    };
    const reply = await chatWithAi([system, ...messages]);
    res.json({ success: true, data: { reply } });
  } catch (err) {
    next(err);
  }
});

export default router;
