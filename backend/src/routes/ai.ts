import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { chatWithAi } from '../services/gemini.js';
import { User } from '../models/User.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const chatBody = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    }),
  ),
});

router.post(
  '/chat',
  requireAuth,
  validate({ body: chatBody }),
  asyncHandler(async (req, res) => {
    const { messages } = req.body as z.infer<typeof chatBody>;
    // Build dynamic system prompt from user's onboarding
    const user = await User.findById(req.userId).lean();
    const goals = user?.goals?.length ? user.goals.join(', ') : 'general wellness';
    const onboarding = user?.onboardingAnswers?.length ? user.onboardingAnswers.join('; ') : '';
    const identityParts: string[] = [];
    if (user?.age) identityParts.push(`age ${user.age}`);
    if (user?.heightCm) identityParts.push(`height ${user.heightCm}cm`);
    if (user?.weightKg) identityParts.push(`weight ${user.weightKg}kg`);
    const identity = identityParts.length ? `User identity: ${identityParts.join(', ')}.` : '';

    const system = {
      role: 'system' as const,
      content: `You are Fitter, an AI Lifestyle Coach powered by Google Gemini.
Tailor advice to the user's goals and answers.
User goals: ${goals}.
Onboarding choices: ${onboarding || 'not provided'}.
${identity}

Always respond STRICTLY as minified JSON with this exact shape:
{"message": string, "actions": Array<{"type": string, "amount"?: number, "hours"?: number, "unit"?: string, "notes"?: string, "calories"?: number, "minutes"?: number, "category"?: string}>}

Action types to use:
- "water_log" for water/hydration (amount + unit, e.g. "glasses", "liters")
- "sleep_log" for sleep (hours)
- "workout_log" for exercise (calories OR minutes, optional category like "cardio", "strength")
- "meal_log" for food (notes describing food, ALWAYS estimate calories, category should be "breakfast"/"lunch"/"dinner"/"snack")

Examples:
User: "I drank 5 glasses of water"
→ {"message":"Great job staying hydrated! 💧","actions":[{"type":"water_log","amount":5,"unit":"glasses"}]}

User: "I slept 7 hours"
→ {"message":"Good rest is essential! 😴","actions":[{"type":"sleep_log","hours":7}]}

User: "I did cardio for 45 minutes"
→ {"message":"Awesome workout! 💪","actions":[{"type":"workout_log","minutes":45,"category":"cardio"}]}

User: "I burned 1000 calories"
→ {"message":"Incredible effort! 🔥","actions":[{"type":"workout_log","calories":1000}]}

User: "I ate pasta for lunch"
→ {"message":"Noted! Pasta can be a good energy source. 🍝","actions":[{"type":"meal_log","notes":"pasta","category":"lunch","calories":400}]}

User: "I had a chicken salad"
→ {"message":"Great choice! Chicken salad is nutritious. 🥗","actions":[{"type":"meal_log","notes":"chicken salad","category":"lunch","calories":350}]}

User: "I ate a big burger with fries"
→ {"message":"That's a hearty meal! 🍔","actions":[{"type":"meal_log","notes":"burger with fries","category":"lunch","calories":800}]}

User: "I had oatmeal for breakfast"
→ {"message":"Perfect start to the day! 🥣","actions":[{"type":"meal_log","notes":"oatmeal","category":"breakfast","calories":250}]}

IMPORTANT: For meal_log actions, ALWAYS estimate calories based on the food described:
- Light meals (salad, soup): 200-400 calories
- Medium meals (pasta, sandwich): 400-600 calories  
- Heavy meals (burger with fries, pizza): 600-1000 calories
- Snacks: 100-300 calories
- Breakfast items: 250-500 calories
- Consider portion size: "big" = +200 calories, "small" = -100 calories

If multiple actions mentioned, return multiple objects in "actions". If no action detected, "actions" should be empty array. No extra text outside JSON.`,
    };

    const raw = await chatWithAi([system, ...messages]);

    const ActionSchema = z.object({
      type: z.string(),
      amount: z.number().optional(),
      hours: z.number().optional(),
      unit: z.string().optional(),
      notes: z.string().optional(),
      calories: z.number().optional(),
      minutes: z.number().optional(),
      category: z.string().optional(),
    });
    const ResponseSchema = z.object({
      message: z.string(),
      actions: z.array(ActionSchema).default([]),
    });

    let dataOut: z.infer<typeof ResponseSchema>;
    try {
      dataOut = ResponseSchema.parse(JSON.parse(raw));
    } catch {
      dataOut = { message: raw, actions: [] };
    }

    // Save messages to database
    const sessionId = `session_${Date.now()}`;
    const userMessage = messages[messages.length - 1];

    try {
      // Save user message
      if (userMessage) {
        await ChatMessage.create({
          userId: req.userId,
          role: 'user',
          content: userMessage.content,
          sessionId,
        });
      }

      // Save AI response
      await ChatMessage.create({
        userId: req.userId,
        role: 'assistant',
        content: dataOut.message,
        sessionId,
      });
    } catch (error) {
      console.error('Failed to save chat messages:', error);
      // Continue without failing the request
    }

    void res.json({
      success: true,
      data: { reply: dataOut.message, actions: dataOut.actions, provider: 'gemini' },
    });
  }),
);

export default router;
