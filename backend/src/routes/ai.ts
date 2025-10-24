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
import { Supplement } from '../models/Supplement.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

// Helper function to estimate micronutrients from food description
function estimateMicronutrients(foodNotes: string): Record<string, number> {
  const notes = foodNotes.toLowerCase();
  const micros: Record<string, number> = {};

  // Fish (omega3, vitaminD)
  if (notes.includes('salmon') || notes.includes('tuna') || notes.includes('fish')) {
    micros.omega3 = 500 + Math.random() * 500; // 500-1000mg
    micros.vitaminD = 5 + Math.random() * 5; // 5-10mcg
  }

  // Dairy (calcium, vitaminD)
  if (notes.includes('milk') || notes.includes('yogurt') || notes.includes('cheese')) {
    micros.calcium = 200 + Math.random() * 100; // 200-300mg
    micros.vitaminD = 1 + Math.random(); // 1-2mcg
  }

  // Leafy greens (iron, folate, calcium)
  if (
    notes.includes('spinach') ||
    notes.includes('kale') ||
    notes.includes('lettuce') ||
    notes.includes('salad')
  ) {
    micros.iron = 2 + Math.random() * 2; // 2-4mg
    micros.folate = 100 + Math.random() * 100; // 100-200mcg
    micros.calcium = 50 + Math.random() * 50; // 50-100mg
  }

  // Nuts (magnesium, iron)
  if (notes.includes('almond') || notes.includes('walnut') || notes.includes('nut')) {
    micros.magnesium = 50 + Math.random() * 50; // 50-100mg
    micros.iron = 1 + Math.random(); // 1-2mg
  }

  // Whole grains (iron, folate, zinc)
  if (
    notes.includes('quinoa') ||
    notes.includes('rice') ||
    notes.includes('pasta') ||
    notes.includes('bread')
  ) {
    micros.iron = 1 + Math.random(); // 1-2mg
    micros.folate = 50 + Math.random() * 50; // 50-100mcg
    micros.zinc = 1 + Math.random(); // 1-2mg
  }

  // Eggs (vitaminD, B12, folate)
  if (notes.includes('egg')) {
    micros.vitaminD = 1;
    micros.b12 = 0.5;
    micros.folate = 30;
  }

  // Red meat (iron, B12, zinc)
  if (notes.includes('beef') || notes.includes('steak') || notes.includes('meat')) {
    micros.iron = 2 + Math.random(); // 2-3mg
    micros.b12 = 1 + Math.random(); // 1-2mcg
    micros.zinc = 2 + Math.random(); // 2-3mg
  }

  // Legumes (iron, folate, magnesium)
  if (notes.includes('bean') || notes.includes('lentil') || notes.includes('chickpea')) {
    micros.iron = 2 + Math.random(); // 2-3mg
    micros.folate = 100 + Math.random() * 50; // 100-150mcg
    micros.magnesium = 50 + Math.random() * 30; // 50-80mg
  }

  return micros;
}

// Helper function to suggest supplements based on nutrition gaps
async function suggestSupplementsNeeded(
  userId: string,
  todayNutrition: unknown[],
  todaySupplements: unknown[],
): Promise<string[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Calculate total micronutrients from food today
  const foodMicros: Record<string, number> = {};
  for (const meal of todayNutrition) {
    const m = meal as { micronutrients?: Record<string, number> };
    if (m.micronutrients) {
      for (const [key, value] of Object.entries(m.micronutrients)) {
        if (typeof value === 'number') {
          foodMicros[key] = (foodMicros[key] || 0) + value;
        }
      }
    }
  }

  // Get supplements in plan
  const supplementsInPlan = await Supplement.find({
    userId: new Types.ObjectId(userId),
    addedToPlan: true,
  }).lean();

  // RDA values
  const rda = {
    vitaminD: 15,
    calcium: 1000,
    magnesium: 400,
    iron: 18,
    zinc: 11,
    omega3: 1000,
    b12: 2.4,
    folate: 400,
  };

  const suggestions: string[] = [];

  // Check deficiencies
  for (const [nutrient, recommended] of Object.entries(rda)) {
    const fromFood = foodMicros[nutrient] || 0;
    const hasSupplement = supplementsInPlan.some((s) => s.nutrients?.[nutrient]);

    if (fromFood < recommended * 0.5 && !hasSupplement) {
      // Less than 50% of RDA and no supplement in plan
      switch (nutrient) {
        case 'omega3':
          suggestions.push('Consider adding an Omega-3 supplement for heart health');
          break;
        case 'calcium':
          suggestions.push('Consider adding a Calcium supplement for bone health');
          break;
        case 'magnesium':
          suggestions.push('Consider adding a Magnesium supplement for muscle function');
          break;
        case 'iron':
          suggestions.push('Consider adding an Iron supplement for energy');
          break;
        case 'b12':
          suggestions.push('Consider adding a B12 supplement for nerve function');
          break;
        case 'folate':
          suggestions.push('Consider adding a Folate supplement for cell growth');
          break;
      }
    }
  }

  return suggestions;
}

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

    // Get supplements in plan
    const supplementsInPlan = await Supplement.find({
      userId: new Types.ObjectId(req.userId),
      addedToPlan: true,
    }).lean();

    const supplementsInPlanList =
      supplementsInPlan.map((s) => `${s.name} (${s.benefit})`).join(', ') || 'None';

    // Build historical context
    const historicalContext = `
TODAY'S PROGRESS (${now.toLocaleDateString('en-US')}):
- Hydration: ${hydrationToday} glasses
- Sleep: ${sleepToday} hours
- Workout: ${workoutToday} calories burned
- Calories: ${caloriesToday} kcal
- Protein: ${proteinToday}g
- Daily tasks: ${completedTasks}/${totalTasks} completed
- Supplements taken today: ${supplementsTakenToday}
- Supplements in plan: ${supplementsInPlanList}

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
        Based on what they're eating and what supplements they have in their plan, suggest specific actions:
        - If they ate salmon but have Omega-3 in plan: "Great! You got omega-3 from salmon today. Don't forget to take your Omega-3 supplement with your next meal."
        - If they ate no fish and have Omega-3 in plan: "I noticed you haven't had fish today. Make sure to take your Omega-3 supplement."
        - If they ate no dairy and have Calcium in plan: "You haven't had dairy today. Take your Calcium supplement."
        - If they have deficiencies but NO supplement in plan: Mention what's missing and suggest adding it to their plan.
        
        When suggesting supplements, reference their actual intake and what they have available.

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

    // Process actions and save logs with micronutrients
    const processedActions = [];
    for (const action of dataOut.actions) {
      if (action.type === 'meal_log' && action.notes && action.calories && action.category) {
        // Estimate micronutrients from food description
        const micronutrients = estimateMicronutrients(action.notes);

        // Estimate macros from calories
        const protein = Math.round(action.calories * 0.2); // ~20% protein
        const carbs = Math.round(action.calories * 0.5); // ~50% carbs
        const fat = Math.round(action.calories * 0.3); // ~30% fat

        try {
          await NutritionLog.create({
            userId: new Types.ObjectId(req.userId),
            date: new Date(),
            mealType: action.category as 'breakfast' | 'lunch' | 'dinner' | 'snack',
            items: [
              {
                name: action.notes,
                calories: action.calories,
                protein,
                carbs,
                fat,
              },
            ],
            total: {
              calories: action.calories,
              protein,
              carbs,
              fat,
            },
            micronutrients,
          });

          processedActions.push({ ...action, micronutrients });
        } catch (error) {
          console.error('Failed to save nutrition log:', error);
          processedActions.push(action);
        }
      } else {
        processedActions.push(action);
      }
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

    // Get supplement suggestions based on today's nutrition
    const supplementSuggestions = await suggestSupplementsNeeded(
      req.userId!,
      todayNutrition,
      todaySupplements,
    );

    void res.json({
      success: true,
      data: {
        reply: dataOut.message,
        actions: processedActions,
        provider: 'gemini',
        supplementSuggestions,
      },
    });
  }),
);

export default router;
