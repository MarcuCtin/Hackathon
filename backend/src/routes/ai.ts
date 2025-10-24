import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { chatWithAi } from '../services/gemini.js';
import { User } from '../models/User.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { Log } from '../models/Log.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { DailyTask } from '../models/DailyTask.js';
import { Achievement } from '../models/Achievement.js';
import { SupplementLog } from '../models/SupplementLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

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

    // Get user profile
    const user = await User.findById(req.userId).lean();
    const goals = user?.goals?.length ? user.goals.join(', ') : 'general wellness';
    const onboarding = user?.onboardingAnswers?.length ? user.onboardingAnswers.join('; ') : '';
    const identityParts: string[] = [];
    if (user?.age) identityParts.push(`age ${user.age}`);
    if (user?.heightCm) identityParts.push(`height ${user.heightCm}cm`);
    if (user?.weightKg) identityParts.push(`weight ${user.weightKg}kg`);
    const identity = identityParts.length ? `User identity: ${identityParts.join(', ')}.` : '';

    // Get current time and day context
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const timeOfDay =
      currentHour < 6
        ? 'late night'
        : currentHour < 12
          ? 'morning'
          : currentHour < 18
            ? 'afternoon'
            : 'evening';

    // Get today's progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayLogs,
      todayNutrition,
      todayTasks,
      weekLogs,
      weekNutrition,
      recentAchievements,
      todaySupplements,
    ] = await Promise.all([
      Log.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: today, $lt: tomorrow },
      }).lean(),
      NutritionLog.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: today, $lt: tomorrow },
      }).lean(),
      DailyTask.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: today, $lt: tomorrow },
      }).lean(),
      Log.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }).lean(),
      NutritionLog.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }).lean(),
      Achievement.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })
        .sort({ date: -1 })
        .limit(10)
        .lean(),
      SupplementLog.find({
        userId: new Types.ObjectId(req.userId),
        date: { $gte: today, $lt: tomorrow },
      }).lean(),
    ]);

    // Calculate today's stats
    const hydrationToday = todayLogs
      .filter((l) => l.type === 'hydration')
      .reduce((sum, l) => sum + (l.value || 0), 0);
    const sleepToday = todayLogs
      .filter((l) => l.type === 'sleep')
      .reduce((sum, l) => sum + (l.value || 0), 0);
    const workoutToday = todayLogs
      .filter((l) => l.type === 'workout')
      .reduce((sum, l) => sum + (l.value || 0), 0);
    const caloriesToday = todayNutrition.reduce((sum, n) => sum + (n.total?.calories || 0), 0);
    const proteinToday = todayNutrition.reduce((sum, n) => sum + (n.total?.protein || 0), 0);
    const completedTasks = todayTasks.filter((t) => t.completed).length;
    const totalTasks = todayTasks.length;

    // Calculate weekly averages
    const sleepThisWeek =
      weekLogs.filter((l) => l.type === 'sleep').reduce((sum, l) => sum + (l.value || 0), 0) / 7;
    const avgCaloriesWeek = weekNutrition.reduce((sum, n) => sum + (n.total?.calories || 0), 0) / 7;
    const avgProteinWeek = weekNutrition.reduce((sum, n) => sum + (n.total?.protein || 0), 0) / 7;
    const workoutsThisWeek = weekLogs.filter((l) => l.type === 'workout').length;

    // Calculate supplements taken today
    const supplementsTakenToday =
      todaySupplements.map((s) => s.supplementName).join(', ') || 'None';

    // Build historical context
    const historicalContext = `
TODAY'S PROGRESS (${now.toLocaleDateString('en-US')}):
- Hydration: ${hydrationToday} glasses
- Sleep: ${sleepToday} hours
- Workout: ${workoutToday} calories burned
- Calories: ${caloriesToday} kcal
- Protein: ${proteinToday}g
- Daily tasks: ${completedTasks}/${totalTasks} completed
- Supplements taken: ${supplementsTakenToday}

LAST 7 DAYS AVERAGE:
- Sleep: ${sleepThisWeek.toFixed(1)} hours/day
- Calories: ${avgCaloriesWeek.toFixed(0)} kcal/day
- Protein: ${avgProteinWeek.toFixed(0)}g/day
- Workouts: ${workoutsThisWeek} sessions

RECENT ACHIEVEMENTS:
${recentAchievements.length > 0 ? recentAchievements.map((a) => `- ${a.title}: ${a.description}`).join('\n') : 'No recent achievements'}
`;

    const system = {
      role: 'system' as const,
      content: `You are Fitter, an AI Lifestyle Coach powered by Google Gemini.
        Tailor advice to the user's goals and answers based on their actual progress and history.
        
        USER PROFILE:
        - Goals: ${goals}
        - Onboarding choices: ${onboarding || 'not provided'}
        ${identity}

        CURRENT CONTEXT:
        - Current time: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        - Current day: ${currentDay}
        - Time of day: ${timeOfDay}
        - Current date: ${now.toLocaleDateString('en-US')}

        ${historicalContext}

        IMPORTANT: Use the historical data above to provide personalized advice. Reference their actual progress when answering questions.

        Consider the time context when responding:
        - Morning (6-12): Focus on breakfast, morning routines, energy for the day
        - Afternoon (12-18): Focus on lunch, afternoon activities, staying hydrated
        - Evening (18-24): Focus on dinner, evening routines, preparing for sleep
        - Late night (0-6): Focus on sleep quality, late night habits

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

        MICRONUTRIENT ESTIMATION IN MEALS:
        When logging meals, estimate micronutrients based on food type:
        - Fish (salmon, tuna): High omega3 (500-1000mg), high protein, vitamin D (5-10mcg)
        - Dairy (milk, yogurt, cheese): High calcium (200-300mg), some vitamin D (1-2mcg)
        - Leafy greens (spinach, kale): High iron (2-4mg), folate (100-200mcg), calcium (50-100mg)
        - Nuts (almonds, walnuts): High magnesium (50-100mg), healthy fats, some iron (1-2mg)
        - Whole grains: Some iron (1-2mg), folate (50-100mcg), zinc (1-2mg)
        - Eggs: Complete protein, vitamin D (1mcg), B12 (0.5mcg), folate (30mcg)
        - Red meat: High iron (2-3mg), B12 (1-2mcg), zinc (2-3mg)
        - Legumes (beans, lentils): High iron (2-3mg), folate (100-150mcg), magnesium (50-80mg)

        SUPPLEMENT CORRELATION:
        Check what supplements were taken today. When suggesting meal logging, consider:
        - If user took Vitamin D supplement, don't over-emphasize Vitamin D in food
        - If user took Omega-3 supplement, note the intake but still log omega-3 rich foods naturally
        - If user took Iron supplement, mention how their meal contributes to daily iron needs
        - If user took Calcium supplement, note how dairy/leafy greens support bone health
        - Always acknowledge supplements taken and correlate with food intake for optimal nutrition

        SUPPLEMENT RECOMMENDATIONS:
        When user logs meals, analyze for deficiencies:
        - Low fish/omega-3 → suggest omega-3 supplement if not already taken
        - Low dairy/calcium → suggest calcium+vitamin D supplement
        - Low leafy greens/iron → suggest iron supplement
        - Low nuts/magnesium → suggest magnesium supplement
        - Low meat/B12 → suggest B12 supplement
        - Low legumes/folate → suggest folate supplement

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
