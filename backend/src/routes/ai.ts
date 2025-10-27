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
import { UserPlan } from '../models/UserPlan.js';
import { UserTargets } from '../models/UserTargets.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

function calculateLiquidWaterContent(
  liquidDescription: string,
  amount: number,
  unit: string,
): number {
  const liquid = liquidDescription.toLowerCase();

  let amountInMl = amount;
  if (unit === 'glass' || unit === 'glasses') {
    amountInMl = amount * 200; // 1 glass = 200ml
  } else if (unit === 'cup' || unit === 'cups') {
    amountInMl = amount * 250; // 1 cup = 250ml
  } else if (unit === 'can' || unit === 'cans') {
    amountInMl = amount * 330; // 1 can = 330ml
  } else if (unit === 'bottle' || unit === 'bottles') {
    amountInMl = amount * 500; // 1 bottle = 500ml
  } else if (unit === 'liter' || unit === 'liters' || unit === 'l') {
    amountInMl = amount * 1000;
  }

  let waterPercentage = 100; // Default to 100% (plain water)

  if (liquid.includes('milk') || liquid.includes('lapte')) {
    waterPercentage = 87; // Milk is ~87% water
  } else if (liquid.includes('cola') || liquid.includes('soda') || liquid.includes('suc')) {
    waterPercentage = 89; // Cola/soda is ~89% water
  } else if (liquid.includes('juice') || liquid.includes('suc de')) {
    waterPercentage = 88; // Juice is ~88% water
  } else if (liquid.includes('coffee') || liquid.includes('cafea')) {
    waterPercentage = 99; // Coffee is ~99% water
  } else if (liquid.includes('tea') || liquid.includes('ceai')) {
    waterPercentage = 99; // Tea is ~99% water
  } else if (liquid.includes('beer') || liquid.includes('bere')) {
    waterPercentage = 93; // Beer is ~93% water
  } else if (liquid.includes('wine') || liquid.includes('vin')) {
    waterPercentage = 86; // Wine is ~86% water
  } else if (liquid.includes('smoothie') || liquid.includes('shake')) {
    waterPercentage = 80; // Smoothies are ~80% water
  } else if (liquid.includes('soup') || liquid.includes('supa')) {
    waterPercentage = 85; // Soup is ~85% water
  } else if (liquid.includes('yogurt') || liquid.includes('iaurt')) {
    waterPercentage = 85; // Yogurt is ~85% water
  } else if (liquid.includes('water') || liquid.includes('apa')) {
    waterPercentage = 100; // Pure water
  }

  return Math.round(amountInMl * (waterPercentage / 100));
}

function estimateMicronutrients(foodNotes: string): Record<string, number> {
  const notes = foodNotes.toLowerCase();
  const micros: Record<string, number> = {};

  if (
    notes.includes('salmon') ||
    notes.includes('tuna') ||
    notes.includes('fish') ||
    notes.includes('sardine') ||
    notes.includes('mackerel')
  ) {
    micros.omega3 = 500 + Math.random() * 500; // 500-1000mg
    micros.vitaminD = 5 + Math.random() * 5; // 5-10mcg
  }

  if (
    notes.includes('milk') ||
    notes.includes('yogurt') ||
    notes.includes('cheese') ||
    notes.includes('lapte') ||
    notes.includes('kaas')
  ) {
    micros.calcium = 200 + Math.random() * 100; // 200-300mg
    micros.vitaminD = 1 + Math.random(); // 1-2mcg
    micros.b12 = 0.5 + Math.random() * 0.5; // 0.5-1mcg
  }

  if (
    notes.includes('spinach') ||
    notes.includes('kale') ||
    notes.includes('lettuce') ||
    notes.includes('salad') ||
    notes.includes('broccoli') ||
    notes.includes('cabbage') ||
    notes.includes('română') ||
    notes.includes('spanac')
  ) {
    micros.iron = 2 + Math.random() * 2; // 2-4mg
    micros.folate = 100 + Math.random() * 100; // 100-200mcg
    micros.calcium = 50 + Math.random() * 50; // 50-100mg
  }

  if (
    notes.includes('almond') ||
    notes.includes('walnut') ||
    notes.includes('nut') ||
    notes.includes('nucă') ||
    notes.includes('nuts') ||
    notes.includes('peanut') ||
    notes.includes('peanut butter')
  ) {
    micros.magnesium = 50 + Math.random() * 50; // 50-100mg
    micros.iron = 1 + Math.random(); // 1-2mg
  }

  if (
    notes.includes('quinoa') ||
    notes.includes('rice') ||
    notes.includes('pasta') ||
    notes.includes('bread') ||
    notes.includes('oats') ||
    notes.includes('oatmeal') ||
    notes.includes('cereal') ||
    notes.includes('wheat')
  ) {
    micros.iron = 1 + Math.random(); // 1-2mg
    micros.folate = 50 + Math.random() * 50; // 50-100mcg
    micros.zinc = 1 + Math.random(); // 1-2mg
  }

  if (notes.includes('egg') || notes.includes('ouă') || notes.includes('ou')) {
    micros.vitaminD = 1;
    micros.b12 = 0.5;
    micros.folate = 30;
  }

  if (
    notes.includes('beef') ||
    notes.includes('steak') ||
    notes.includes('meat') ||
    notes.includes('carne') ||
    notes.includes('pork') ||
    notes.includes('ribs')
  ) {
    micros.iron = 2 + Math.random(); // 2-3mg
    micros.b12 = 1 + Math.random(); // 1-2mcg
    micros.zinc = 2 + Math.random(); // 2-3mg
  }

  if (
    notes.includes('chicken') ||
    notes.includes('turkey') ||
    notes.includes('pui') ||
    notes.includes('curcan')
  ) {
    micros.iron = 1 + Math.random(); // 1-2mg
    micros.b12 = 0.5 + Math.random() * 0.5; // 0.5-1mcg
    micros.zinc = 1 + Math.random(); // 1-2mg
  }

  if (
    notes.includes('bean') ||
    notes.includes('lentil') ||
    notes.includes('chickpea') ||
    notes.includes('fasole') ||
    notes.includes('soy') ||
    notes.includes('tofu') ||
    notes.includes('tempeh')
  ) {
    micros.iron = 2 + Math.random(); // 2-3mg
    micros.folate = 100 + Math.random() * 50; // 100-150mcg
    micros.magnesium = 50 + Math.random() * 30; // 50-80mg
  }

  if (
    notes.includes('seed') ||
    notes.includes('chia') ||
    notes.includes('flax') ||
    notes.includes('semințe') ||
    notes.includes('sunflower') ||
    notes.includes('pumpkin')
  ) {
    micros.magnesium = 40 + Math.random() * 40; // 40-80mg
    micros.zinc = 1 + Math.random(); // 1-2mg
    micros.omega3 = 100 + Math.random() * 200; // 100-300mg
  }

  if (
    notes.includes('berry') ||
    notes.includes('strawberry') ||
    notes.includes('blueberry') ||
    notes.includes('raspberry') ||
    notes.includes('blackberry') ||
    notes.includes('fructe de pădure')
  ) {
    micros.folate = 50 + Math.random() * 50; // 50-100mcg
  }

  if (
    notes.includes('orange') ||
    notes.includes('lemon') ||
    notes.includes('lime') ||
    notes.includes('grapefruit') ||
    notes.includes('portocală') ||
    notes.includes('lămâie')
  ) {
    micros.folate = 30 + Math.random() * 30; // 30-60mcg
  }

  if (notes.includes('banana') || notes.includes('banană')) {
    micros.magnesium = 20 + Math.random() * 20; // 20-40mg
  }

  if (notes.includes('avocado') || notes.includes('avocat')) {
    micros.folate = 100 + Math.random() * 50; // 100-150mcg
  }

  if (
    notes.includes('tomato') ||
    notes.includes('tomatoes') ||
    notes.includes('roșii') ||
    notes.includes('roșie')
  ) {
    micros.folate = 20 + Math.random() * 20; // 20-40mcg
  }

  if (
    notes.includes('carrot') ||
    notes.includes('carrots') ||
    notes.includes('morcov') ||
    notes.includes('morcovi')
  ) {
    micros.iron = 0.5 + Math.random() * 0.5; // 0.5-1mg
  }

  if (notes.includes('sweet potato') || notes.includes('batat') || notes.includes('cartof dulce')) {
    micros.iron = 1 + Math.random(); // 1-2mg
  }

  return micros;
}

async function suggestSupplementsNeeded(
  userId: string,
  todayNutrition: unknown[],
  todaySupplements: unknown[],
): Promise<string[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

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

  const supplementMicros: Record<string, number> = {};
  for (const supplementLog of todaySupplements) {
    const s = supplementLog as { supplementId: Types.ObjectId };
    const supplement = await Supplement.findById(s.supplementId).lean();
    if (supplement?.nutrients) {
      for (const [key, value] of Object.entries(supplement.nutrients)) {
        if (typeof value === 'number') {
          supplementMicros[key] = (supplementMicros[key] || 0) + value;
        }
      }
    }
  }

  const supplementsInPlan = await Supplement.find({
    userId: new Types.ObjectId(userId),
    addedToPlan: true,
  }).lean();

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

  for (const [nutrient, recommended] of Object.entries(rda)) {
    const fromFood = foodMicros[nutrient] || 0;
    const fromSupplements = supplementMicros[nutrient] || 0;
    const total = fromFood + fromSupplements;
    const hasSupplement = supplementsInPlan.some((s) => s.nutrients?.[nutrient]);

    if (total < recommended * 0.5 && !hasSupplement) {
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

    const user = await User.findById(req.userId).lean();
    const goals = user?.goals?.length ? user.goals.join(', ') : 'general wellness';
    const onboarding = user?.onboardingAnswers?.length ? user.onboardingAnswers.join('; ') : '';
    const identityParts: string[] = [];
    if (user?.age) identityParts.push(`age ${user.age}`);
    if (user?.heightCm) identityParts.push(`height ${user.heightCm}cm`);
    if (user?.weightKg) identityParts.push(`weight ${user.weightKg}kg`);
    const identity = identityParts.length ? `User identity: ${identityParts.join(', ')}.` : '';

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
      activePlan,
      userTargets,
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
      UserPlan.findOne({
        userId: new Types.ObjectId(req.userId),
        status: 'active',
      })
        .sort({ startDate: -1 })
        .lean(),
      UserTargets.findOne({
        userId: new Types.ObjectId(req.userId),
      }).lean(),
    ]);

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

    const sleepThisWeek =
      weekLogs.filter((l) => l.type === 'sleep').reduce((sum, l) => sum + (l.value || 0), 0) / 7;
    const avgCaloriesWeek = weekNutrition.reduce((sum, n) => sum + (n.total?.calories || 0), 0) / 7;
    const avgProteinWeek = weekNutrition.reduce((sum, n) => sum + (n.total?.protein || 0), 0) / 7;
    const workoutsThisWeek = weekLogs.filter((l) => l.type === 'workout').length;

    const supplementsTakenToday =
      todaySupplements.map((s) => s.supplementName).join(', ') || 'None';

    const supplementsInPlan = await Supplement.find({
      userId: new Types.ObjectId(req.userId),
      addedToPlan: true,
    }).lean();

    const supplementsInPlanList =
      supplementsInPlan.map((s) => `${s.name} (${s.benefit})`).join(', ') || 'None';

    let planContext = '';
    if (activePlan) {
      const currentWeek =
        Math.floor(
          (now.getTime() - new Date(activePlan.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7),
        ) + 1;
      const weeksRemaining = Math.max(0, activePlan.durationWeeks - currentWeek + 1);
      planContext = `
CURRENT ACTIVE PLAN:
- Plan Name: ${activePlan.planName}
- Plan Type: ${activePlan.planType}
- Description: ${activePlan.description || 'No description'}
- Duration: ${activePlan.durationWeeks} weeks
- Current Week: Week ${currentWeek} of ${activePlan.durationWeeks}
- Weeks Remaining: ${weeksRemaining}
- Primary Goal: ${activePlan.primaryGoal || 'Not specified'}
- Secondary Goals: ${activePlan.secondaryGoals?.join(', ') || 'None'}
- Target Calories: ${activePlan.targetCalories} kcal/day
- Target Protein: ${activePlan.targetProtein}g/day
- Target Carbs: ${activePlan.targetCarbs}g/day
- Target Fat: ${activePlan.targetFat}g/day
- Started: ${new Date(activePlan.startDate).toLocaleDateString('en-US')}
- Status: ${activePlan.status}
`;
    }

    let targetsContext = '';
    if (userTargets) {
      targetsContext = `
CURRENT DAILY TARGETS:
- Calories: ${userTargets.calories?.target || 'Not set'} kcal
- Protein: ${userTargets.protein?.target || 'Not set'}g
- Carbs: ${userTargets.carbs?.target || 'Not set'}g
- Fat: ${userTargets.fat?.target || 'Not set'}g
- Water: ${userTargets.water?.target || 'Not set'}L
- Caffeine: ${userTargets.caffeine?.target || 'Not set'}mg
- Vitamin D: ${userTargets.vitaminD?.target || 'Not set'}mcg
- Calcium: ${userTargets.calcium?.target || 'Not set'}mg
- Magnesium: ${userTargets.magnesium?.target || 'Not set'}mg
- Iron: ${userTargets.iron?.target || 'Not set'}mg
- Zinc: ${userTargets.zinc?.target || 'Not set'}mg
- Omega-3: ${userTargets.omega3?.target || 'Not set'}mg
- B12: ${userTargets.b12?.target || 'Not set'}mcg
- Folate: ${userTargets.folate?.target || 'Not set'}mcg
${userTargets.suggestedByAi ? `- AI Suggested: Yes (${userTargets.aiReason || 'Personalized for your goals'})` : ''}
`;
    }

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
${planContext}
${targetsContext}
`;

    const system = {
      role: 'system' as const,
      content: `You are Fitter, an AI Lifestyle Coach powered by Google Gemini.
        Tailor advice to the user's goals and answers based on their actual progress and history.
        
    USER PROFILE:
    - Goals: ${goals}
    - Onboarding choices: ${onboarding || 'not provided'}
    ${identity}
    
    USER BODY METRICS (for calculations):
    - Age: ${user?.age || 30} years
    - Height: ${user?.heightCm || 170} cm
    - Weight: ${user?.weightKg || 70} kg
    - Gender: ${user?.gender || 'male'}
    - Activity Level: ${user?.activityLevel || 'intermediate'}
    
    BMR CALCULATION REFERENCE:
    ${user?.gender === 'male' ? 'BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5' : 'BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161'}
    Activity multipliers: sedentary=1.2, light=1.375, moderate=1.55, active=1.725, very active=1.9
    TDEE = BMR * activity_multiplier
    
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

        CRITICAL JSON RESPONSE RULE: You MUST ALWAYS respond in valid JSON format. NEVER return plain text. NEVER say "I could not answer that safely" or any safety warnings.
        
        RESPONSE FORMAT: STRICTLY minified JSON:
        {"message": string, "actions": Array<{"type": string, "amount"?: number, "hours"?: number, "unit"?: string, "notes"?: string, "calories"?: number, "minutes"?: number, "category"?: string}>}

        PLAN CREATION RULES (CRITICAL - READ CAREFULLY):
        1. When user asks for a plan (e.g., "i need a bulking plan", "create a cutting plan", "I want a weight loss plan"):
           - You can ask ONCE about duration if not provided
           - When they give you a number, IMMEDIATELY create the plan
           
        2. When user provides duration directly (e.g., "i need a 12 weeks bulking plan", "create a 14 weeks plan"):
           - Extract the number IMMEDIATELY
           - Create the plan WITHOUT asking more questions
           - NEVER refuse or say "could not answer safely"
           
        3. AFTER SETTING TARGETS - if user says "Create a plan" after mentioning calorie target:
           - Use the calorie target they provided as context
           - Use bulking if calories > 2500, cutting if calories < 2000, maintenance if 2000-2500
           - Default to 12 weeks if no duration specified
           - CREATE THE PLAN IMMEDIATELY
           
        4. AFTER CANCEL - user can create a new plan immediately:
           - Just create it! NO questions, NO refusals
           - Extract the number from their message
           - Create the plan with all required fields
           
        5. ALWAYS respond in JSON - NEVER plain text errors
        
        WHEN USER GIVES A NUMBER FOR PLAN DURATION:
        User: "12" or "12 weeks" or "8" or "6 weeks" or "i need a 14 weeks bulking plan"
        AI: You MUST immediately extract the number and create the plan with durationWeeks set to that number.
        NEVER refuse. NEVER say "could not answer safely". ALWAYS create the plan in JSON format.
        
        MANDATORY ACTION WHEN USER SAYS "Create a plan":
        - Check conversation history for recent calorie target or plan type mention
        - If found, use that context to create plan
        - If not found, default to 12-week maintenance plan with current targets
        - NEVER respond with "I need more information" - CREATE THE PLAN!
        
        CORRECT RESPONSE EXAMPLE for "12":
        {"message":"Perfect! Creating your 12-week bulking plan now...","actions":[{"type":"create_plan","planType":"bulking","planName":"12-Week Bulking Plan","description":"A personalized 12-week muscle building plan","durationWeeks":12,"targetCalories":2500,"targetProtein":150,"targetCarbs":300,"targetFat":80,"primaryGoal":"Build muscle mass","secondaryGoals":["Gain strength"],"focusAreas":["High protein intake","Calorie surplus"],"aiConversationHistory":[{"question":"How many weeks?","answer":"12"}]}]}

        PLAN CREATION AFTER CANCEL:
        After user cancels a plan and immediately asks for a new plan (like "i need a 14 weeks bulking plan"), you MUST create it IMMEDIATELY.
        DO NOT ask questions. DO NOT say "could not answer safely". Just extract the number and CREATE THE PLAN.
        
        EXAMPLE AFTER CANCEL:
        User: "cancel my plan"
        AI: {"message":"Understood. Your current plan has been cancelled.","actions":[{"type":"cancel_plan"}]}
        User: "i need a 14 weeks bulking plan"
        AI: {"message":"Perfect! Creating your 14-week bulking plan now...","actions":[{"type":"create_plan","planType":"bulking","planName":"14-Week Bulking Plan","description":"A personalized 14-week muscle building plan","durationWeeks":14,"targetCalories":2600,"targetProtein":160,"targetCarbs":320,"targetFat":85,"primaryGoal":"Build muscle mass","secondaryGoals":["Gain strength"],"focusAreas":["High protein intake","Calorie surplus"]}]}

        Action types to use:
        - "water_log" for water/hydration and ANY liquids (amount + unit + notes describing the liquid)
        - "sleep_log" for sleep (hours)
        - "workout_log" for exercise (calories OR minutes, optional category like "cardio", "strength")
        - "meal_log" for food (notes describing food, ALWAYS estimate calories, category should be "breakfast"/"lunch"/"dinner"/"snack")
        - "supplement_log" for supplements (supplementName + dosage optional, notes optional)
        - "create_plan" for creating nutrition/fitness plans (planType, planName, durationWeeks, targets, etc.)
        - "cancel_plan" for cancelling current active plan
        - "update_targets" for updating nutrition targets (targetCalories, targetProtein, etc.)

        LIQUID DETECTION:
        When user mentions drinking ANY liquid (water, milk, cola, juice, coffee, tea, beer, soup, etc.):
        - Create a "water_log" action with the liquid description in "notes"
        - Use amount and unit (e.g., "1 cup", "2 glasses", "1 can", "500ml")
        - The system will automatically calculate the water content percentage:
          * Milk/lapte: 87% water
          * Cola/soda/suc: 89% water
          * Juice/suc de: 88% water
          * Coffee/cafea: 99% water
          * Tea/ceai: 99% water
          * Beer/bere: 93% water
          * Smoothie/shake: 80% water
          * Soup/supa: 85% water
          * Yogurt/iaurt: 85% water
          * Pure water/apa: 100% water
        - This ensures liquids count toward hydration goals!

        Examples:
        User: "I drank 5 glasses of water"
        → {"message":"Great job staying hydrated! 💧","actions":[{"type":"water_log","amount":5,"unit":"glasses","notes":"water"}]}

        User: "I drank 1 cup of milk"
        → {"message":"Good! Milk hydrates you too. 🥛","actions":[{"type":"water_log","amount":1,"unit":"cup","notes":"milk"}]}

        User: "I had a can of cola"
        → {"message":"Noted! Cola contributes to your hydration. 🥤","actions":[{"type":"water_log","amount":1,"unit":"can","notes":"cola"}]}

        User: "I drank 2 cups of coffee"
        → {"message":"Coffee helps with hydration! ☕","actions":[{"type":"water_log","amount":2,"unit":"cup","notes":"coffee"}]}

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

        User: "I took Omega-3 supplement"
        → {"message":"Great! Supplement logged. 💊","actions":[{"type":"supplement_log","supplementName":"Omega-3","dosage":"1 capsule"}]}

        User: "I took my vitamin D"
        → {"message":"Logged! Vitamin D is important for bone health. ☀️","actions":[{"type":"supplement_log","supplementName":"Vitamin D","dosage":"1 tablet"}]}

        SUPPLEMENT LOGGING:
        When user mentions taking a supplement (e.g., "I took omega-3", "am luat vitamina D", "I took my calcium"):
        - Use "supplement_log" action
        - Extract supplement name from their message (Omega-3, Vitamin D, Calcium, Iron, Magnesium, etc.)
        - Estimate dosage if not mentioned (typically "1 capsule", "1 tablet", "1 pill")
        - Be encouraging about their supplement routine
        - Common supplements: Omega-3, Vitamin D, Calcium, Magnesium, Iron, Zinc, B12, Multivitamin

        User: "I just ate the lunch you suggested" or "I ate your suggested meal" or "am mancat light dinner"
        → When user mentions eating something YOU suggested:
        - Extract the meal description from their message
        - Detect which meal they're referring to (e.g., "light dinner" = "dinner", "lunch" = "lunch", "breakfast" = "breakfast")
        - Set consumedSuggestionId to the meal type (e.g., "dinner", "lunch", "breakfast", "snack")
        - Log it with appropriate calories and category based on time of day
        - Be enthusiastic and acknowledge they followed your recommendation
        - Example: {"message":"Great choice! Following suggestions helps you hit your goals! 🎯","actions":[{"type":"meal_log","notes":"grilled chicken breast, quinoa salad, olive oil dressing","category":"lunch","calories":600}],"consumedSuggestionId":"lunch"}

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

        PLAN CREATION:
        When user mentions wanting to create a new nutrition/fitness plan, interpret their request dynamically:
        
        STEP 1: UNDERSTAND USER INTENT
        Listen carefully to what the user wants. They might say:
        - "Vreau un plan pentru să pierd în greutate" → weight loss plan
        - "Vreau să cresc în masă musculară" → muscle gain plan
        - "Am nevoie de un plan pentru să mănânc mai sănătos" → healthy eating plan
        - "Vreau un plan pentru să recuperez după accident" → recovery/healing plan
        - "Vreau un plan personalizat pentru goal X" → custom plan
        
        DO NOT use pre-defined templates. Instead, INTERPRET their specific needs and create a DYNAMIC plan.
        
        STEP 2: GATHER INFORMATION OR CREATE PLAN DIRECTLY
        
        CRITICAL: If the user mentions BOTH plan type AND duration in the same message, CREATE THE PLAN IMMEDIATELY!
        
        Examples of IMMEDIATE plan creation (user provides all info):
        - "i need a 12weeks bulking plan" → CREATE PLAN NOW (bulking, 12 weeks)
        - "create a 8 week cutting plan" → CREATE PLAN NOW (cutting, 8 weeks)
        - "vreau un plan de 10 săptămâni pentru pierderea în greutate" → CREATE PLAN NOW (cutting, 10 weeks)
        - "12 weeks bulking" → CREATE PLAN NOW (bulking, 12 weeks)
        - "bulking plan for 6 weeks" → CREATE PLAN NOW (bulking, 6 weeks)
        
        GOOD FLOW when user only mentions plan type:
        User: "I want a weight loss plan"
        AI: "Got it! How many weeks would you like this plan to last? (e.g., 4, 8, 12 weeks)"
        User: "12 weeks" or "12" or "12 weeks please"
        AI: Immediately create the plan with durationWeeks: 12 - DO NOT ask more questions, just create it!
        
        When user answers with a number, extract it and CREATE THE PLAN immediately:
        - "12 weeks" → durationWeeks: 12
        - "12" → durationWeeks: 12
        - "8" → durationWeeks: 8
        - "6 weeks" → durationWeeks: 6
        
        EXTRACTION RULES:
        - "12 weeks bulking" → planType: "bulking", durationWeeks: 12
        - "bulking plan 12 weeks" → planType: "bulking", durationWeeks: 12
        - "create 8 week cutting plan" → planType: "cutting", durationWeeks: 8
        - "i need bulking for 12 weeks" → planType: "bulking", durationWeeks: 12
        
        You can ask ONE clarifying question if needed (duration only), but when they answer with a number OR provide both type+duration, IMMEDIATELY create the plan.
        DO NOT keep asking questions - proceed to plan creation!
        
        STEP 3: CALCULATE DYNAMIC TARGETS
        Based on the user's request and their profile (from context above), calculate personalized targets:
        
        For WEIGHT LOSS plans:
        - Calories: BMR * activity_level * 0.8 to 0.85 (20-15% deficit)
        - Protein: 1.8-2.2g per kg body weight (preserve muscle)
        - Carbs: 30-40% of calories
        - Fat: 20-30% of calories
        
        For MUSCLE GAIN plans:
        - Calories: BMR * activity_level * 1.1 to 1.2 (10-20% surplus)
        - Protein: 2.0-2.4g per kg body weight
        - Carbs: 40-50% of calories (fuel for workouts)
        - Fat: 20-30% of calories
        
        For HEALTHY EATING plans:
        - Calories: BMR * activity_level (maintenance)
        - Protein: 1.4-1.8g per kg body weight
        - Carbs: 45-55% of calories
        - Fat: 25-35% of calories
        
        For RECOVERY/HEALING plans:
        - Calories: BMR * activity_level * 1.0 to 1.1 (slight surplus)
        - Protein: 1.6-2.0g per kg body weight (recovery)
        - Carbs: 40-50% of calories
        - Fat: 25-30% of calories
        
        STEP 4: CREATE THE PLAN ACTION
        Once you have all information, create the plan using "create_plan" action:
        {
          "type": "create_plan",
          "planType": "cutting/bulking/maintenance/healing/custom",
          "planName": "Descriptive name based on user's goals (e.g., '30 Day Weight Loss Transformation', 'Muscle Building Journey')",
          "description": "Detailed description of what this plan achieves and how it works",
          "durationWeeks": number (user specified or default 4-12 weeks),
          "targetCalories": number (calculated from BMR),
          "targetProtein": number (calculated from body weight),
          "targetCarbs": number (calculated from calories),
          "targetFat": number (calculated from calories),
          "primaryGoal": "Specific measurable goal (e.g., 'Lose 5kg in 8 weeks')",
          "secondaryGoals": ["Supporting goals"],
          "focusAreas": ["Key focus areas based on user's needs"],
          "aiConversationHistory": [
            {"question": "What's your main goal?", "answer": "User's answer"},
            {"question": "Any preferences?", "answer": "User's answer"}
          ]
        }
        
        IMPORTANT:
        - The planType should reflect the user's intent, not rigid categories
        - Calculate targets dynamically based on user's profile, not templates
        - Make the plan description reflect their specific goals
        - Plan name should be inspiring and specific to their journey
        - When user answers with a number after you ask about duration, IMMEDIATELY create the plan with that number
        - DO NOT ask follow-up questions once you have the duration - just create it!

        EXAMPLE CONVERSATION:
        User: "I want a cutting plan"
        AI: "Got it! How many weeks would you like this plan to last?"
        User: "12 weeks"
        AI: {"message":"Perfect! Creating your 12-week cutting plan now...","actions":[{"type":"create_plan","planType":"cutting","planName":"12-Week Cutting Plan","description":"A personalized 12-week plan focused on fat loss while maintaining energy and muscle mass","durationWeeks":12,"targetCalories":1700,"targetProtein":135,"targetCarbs":160,"targetFat":55,"primaryGoal":"Achieve healthy fat loss","secondaryGoals":["Maintain muscle mass"],"focusAreas":["Calorie deficit for fat loss","High protein intake"],"aiConversationHistory":[{"question":"How many weeks?","answer":"12 weeks"}]}]}

        CRITICAL REQUIREMENTS FOR create_plan ACTION:
        - You MUST include ALL required fields: planType, planName, description, durationWeeks, targetCalories, targetProtein, targetCarbs, targetFat
        - The description field is REQUIRED - don't skip it!
        - If you skip ANY required field, the plan won't be created!

        PLAN CANCELLATION:
        When user asks to cancel/stop their current plan (e.g., "cancel my plan", "stop my plan", "cancel current plan", "i want to cancel"):
        - You MUST return a "cancel_plan" action type in the actions array
        - This will set the plan status to 'cancelled' in the database
        - Always confirm cancellation in your message
        - Example:
        User: "cancel my current plan"
        → {"message":"Understood. Your current plan has been cancelled.","actions":[{"type":"cancel_plan"}]}
        
        CRITICAL: When the user requests to cancel, ALWAYS include {"type":"cancel_plan"} in the actions array.

        UPDATE TARGETS DIRECTLY:
        When user mentions wanting to change their daily targets (e.g., "vreau un nou target de 3000 calorii", "set calories to 2500", "change protein target to 150g"):
        - Use "update_targets" action to update specific targets
        - Only include the fields that the user wants to change
        - Example:
        User: "vreau un nou target de 3000 calorii"
        → {"message":"Understood! Your new daily calorie target is now set to 3000 kcal.","actions":[{"type":"update_targets","targetCalories":3000}]}

        User: "set my protein to 150g"
        → {"message":"Got it! Your protein target is now 150g per day.","actions":[{"type":"update_targets","targetProtein":150}]}

        Supported fields for update_targets:
        - targetCalories (number)
        - targetProtein (number, in grams)
        - targetCarbs (number, in grams)
        - targetFat (number, in grams)
        - targetWater (number, in liters)
        - targetCaffeine (number, in mg)

        If multiple actions mentioned, return multiple objects in "actions". If no action detected, "actions" should be empty array. No extra text outside JSON.
        
        FINAL REMINDER: When user responds with just a number (like "12", "8", "12 weeks"), you MUST:
        1. Extract the number
        2. Create the plan immediately with that duration
        3. Return ONLY valid JSON - no plain text, no safety warnings
        4. NEVER say "I could not answer safely" - just create the plan!`,
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
      supplementName: z.string().optional(),
      dosage: z.string().optional(),
      planType: z.string().optional(),
      planName: z.string().optional(),
      description: z.string().optional(),
      durationWeeks: z.number().optional(),
      targetCalories: z.number().optional(),
      targetProtein: z.number().optional(),
      targetCarbs: z.number().optional(),
      targetFat: z.number().optional(),
      primaryGoal: z.string().optional(),
      secondaryGoals: z.array(z.string()).optional(),
      focusAreas: z.array(z.string()).optional(),
      aiConversationHistory: z
        .array(
          z.object({
            question: z.string(),
            answer: z.string(),
          }),
        )
        .optional(),
      targetWater: z.number().optional(),
      targetCaffeine: z.number().optional(),
    });
    const ResponseSchema = z.object({
      message: z.string(),
      actions: z.array(ActionSchema).default([]),
      consumedSuggestionId: z.string().optional(), // ID of suggested meal consumed
    });

    let dataOut: z.infer<typeof ResponseSchema>;
    try {
      let jsonStr = raw.trim();

      if (jsonStr.startsWith('{') && jsonStr.endsWith('}')) {
        dataOut = ResponseSchema.parse(JSON.parse(jsonStr));
      } else {
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          dataOut = ResponseSchema.parse(JSON.parse(jsonMatch[0]));
        } else {
          console.error('No JSON found in AI response:', raw);
          dataOut = { message: raw, actions: [] };
        }
      }

      console.log('AI Response parsed successfully:', JSON.stringify(dataOut));
    } catch (parseError) {
      console.error('Failed to parse AI response:', raw);
      console.error('Parse error:', parseError);
      dataOut = { message: raw, actions: [] };
    }

    const processedActions = [];
    console.log('Processing', dataOut.actions.length, 'actions');
    for (const action of dataOut.actions) {
      console.log('Processing action:', action.type, action);
      if (action.type === 'meal_log' && action.notes && action.calories && action.category) {
        const micronutrients = estimateMicronutrients(action.notes);

        const protein = Math.round(action.calories * 0.2); // ~20% protein
        const carbs = Math.round(action.calories * 0.5); // ~50% carbs
        const fat = Math.round(action.calories * 0.3); // ~30% fat

        try {
          const isSuggestedMeal = !!dataOut.consumedSuggestionId;

          const nutritionLog = await NutritionLog.create({
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
            suggestedByAi: isSuggestedMeal,
          });

          console.log('Nutrition log created successfully:', nutritionLog._id);
          processedActions.push({ ...action, micronutrients });
        } catch (error) {
          console.error('Failed to save nutrition log:', error);
          processedActions.push(action);
        }
      } else if (action.type === 'water_log' && action.amount) {
        const liquidDescription = action.notes || 'water';
        const waterAmountInMl = calculateLiquidWaterContent(
          liquidDescription,
          action.amount,
          action.unit || 'glass',
        );

        const valueInGlasses = waterAmountInMl / 200;
        const unit = 'glasses';

        try {
          await Log.create({
            userId: new Types.ObjectId(req.userId),
            type: 'hydration',
            value: valueInGlasses,
            unit,
            note: `Logged via AI chat: ${action.amount} ${action.unit || 'glass'} of ${liquidDescription} (${waterAmountInMl}ml water content)`,
            date: new Date(),
          });
          processedActions.push({ ...action, calculatedWaterMl: waterAmountInMl });
        } catch (error) {
          console.error('Failed to save water log:', error);
          processedActions.push(action);
        }
      } else if (action.type === 'sleep_log' && action.hours) {
        try {
          await Log.create({
            userId: new Types.ObjectId(req.userId),
            type: 'sleep',
            value: action.hours,
            unit: 'hours',
            note: action.notes || `Logged via AI chat`,
            date: new Date(),
          });
          processedActions.push(action);
        } catch (error) {
          console.error('Failed to save sleep log:', error);
          processedActions.push(action);
        }
      } else if (action.type === 'workout_log' && (action.calories || action.minutes)) {
        const value = action.calories || action.minutes || 0;
        const unit = action.calories ? 'calories' : 'minutes';

        try {
          await Log.create({
            userId: new Types.ObjectId(req.userId),
            type: 'workout',
            value,
            unit,
            note: action.notes || action.category || `Logged via AI chat`,
            date: new Date(),
          });
          processedActions.push(action);
        } catch (error) {
          console.error('Failed to save workout log:', error);
          processedActions.push(action);
        }
      } else if (action.type === 'create_plan') {
        console.log('Creating plan with action:', JSON.stringify(action));

        if (!action.planType || !action.planName || !action.durationWeeks) {
          console.error('Missing required fields for plan creation:', {
            planType: action.planType,
            planName: action.planName,
            durationWeeks: action.durationWeeks,
          });
          processedActions.push(action);
        } else {
          try {
            const { UserPlan } = await import('../models/UserPlan.js');
            const { UserTargets } = await import('../models/UserTargets.js');

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + action.durationWeeks * 7);

            await UserPlan.updateMany(
              {
                userId: new Types.ObjectId(req.userId),
                status: 'active',
              },
              {
                $set: { status: 'paused' },
              },
            );

            const newPlan = await UserPlan.create({
              userId: new Types.ObjectId(req.userId),
              planType: action.planType as
                | 'cutting'
                | 'bulking'
                | 'maintenance'
                | 'healing'
                | 'custom',
              planName: action.planName,
              description:
                action.description ||
                `A personalized ${action.durationWeeks}-week ${action.planType} plan`,
              durationWeeks: action.durationWeeks,
              startDate,
              endDate,
              status: 'active',
              targetCalories: action.targetCalories || 2000,
              targetProtein: action.targetProtein || 120,
              targetCarbs: action.targetCarbs || 250,
              targetFat: action.targetFat || 70,
              primaryGoal: action.primaryGoal || 'Improve overall health',
              secondaryGoals: action.secondaryGoals || [],
              focusAreas: action.focusAreas || [],
              aiConversationHistory:
                action.aiConversationHistory?.map((item) => ({
                  question: item.question,
                  answer: item.answer,
                  timestamp: new Date(),
                })) || [],
            });

            console.log('Plan created successfully:', newPlan._id);

            await UserTargets.findOneAndUpdate(
              { userId: new Types.ObjectId(req.userId) },
              {
                $set: {
                  calories: { target: action.targetCalories || 2000, current: 0 },
                  protein: { target: action.targetProtein || 120, current: 0 },
                  carbs: { target: action.targetCarbs || 250, current: 0 },
                  fat: { target: action.targetFat || 70, current: 0 },
                  suggestedByAi: true,
                  aiReason: `Part of ${action.planName}`,
                },
              },
              { upsert: true },
            );

            processedActions.push({ ...action, planId: newPlan._id });
          } catch (error) {
            console.error('Failed to create plan:', error);
            processedActions.push(action);
          }
        }
      } else if (action.type === 'update_targets') {
        try {
          const { UserTargets } = await import('../models/UserTargets.js');

          const existingTargets = await UserTargets.findOne({
            userId: new Types.ObjectId(req.userId),
          }).lean();

          const updateFields: Record<string, { target: number; current: number }> = {};

          if (action.targetCalories !== undefined) {
            updateFields.calories = {
              target: action.targetCalories,
              current: existingTargets?.calories?.current || 0,
            };
          }
          if (action.targetProtein !== undefined) {
            updateFields.protein = {
              target: action.targetProtein,
              current: existingTargets?.protein?.current || 0,
            };
          }
          if (action.targetCarbs !== undefined) {
            updateFields.carbs = {
              target: action.targetCarbs,
              current: existingTargets?.carbs?.current || 0,
            };
          }
          if (action.targetFat !== undefined) {
            updateFields.fat = {
              target: action.targetFat,
              current: existingTargets?.fat?.current || 0,
            };
          }
          if (action.targetWater !== undefined) {
            updateFields.water = {
              target: action.targetWater,
              current: existingTargets?.water?.current || 0,
            };
          }
          if (action.targetCaffeine !== undefined) {
            updateFields.caffeine = {
              target: action.targetCaffeine,
              current: existingTargets?.caffeine?.current || 0,
            };
          }

          if (Object.keys(updateFields).length > 0) {
            await UserTargets.findOneAndUpdate(
              { userId: new Types.ObjectId(req.userId) },
              {
                $set: {
                  ...updateFields,
                  suggestedByAi: true,
                  aiReason: 'Updated via AI chat',
                  updatedAt: new Date(),
                },
              },
              { upsert: true },
            );

            processedActions.push({ ...action, updatedFields: Object.keys(updateFields) });
          } else {
            processedActions.push(action);
          }
        } catch (error) {
          console.error('Failed to update targets:', error);
          processedActions.push(action);
        }
      } else if (action.type === 'cancel_plan') {
        try {
          const { UserPlan } = await import('../models/UserPlan.js');

          const result = await UserPlan.updateMany(
            {
              userId: new Types.ObjectId(req.userId),
              status: 'active',
            },
            {
              $set: { status: 'cancelled', updatedAt: new Date() },
            },
          );

          console.log(`Cancelled ${result.modifiedCount} active plan(s)`);
          processedActions.push({ ...action, cancelledPlans: result.modifiedCount });
        } catch (error) {
          console.error('Failed to cancel plan:', error);
          processedActions.push(action);
        }
      } else if (action.type === 'supplement_log' && action.supplementName) {
        try {
          const { Supplement } = await import('../models/Supplement.js');
          const { SupplementLog } = await import('../models/SupplementLog.js');

          let supplement = await Supplement.findOne({
            userId: new Types.ObjectId(req.userId),
            name: { $regex: new RegExp('^' + action.supplementName + '$', 'i') },
          }).lean();

          let supplementId: Types.ObjectId;
          let supplementName: string;
          let supplementNutrients: Record<string, number | undefined> | undefined;

          if (!supplement) {
            const nutrients: Record<string, number> = {};
            const lowerName = action.supplementName.toLowerCase();

            if (lowerName.includes('omega') || lowerName.includes('fish oil')) {
              nutrients.omega3 = 1000; // 1000mg omega-3
            }
            if (lowerName.includes('vitamin d') || lowerName.includes('vitamina d')) {
              nutrients.vitaminD = 25; // 25mcg (1000 IU)
            }
            if (lowerName.includes('calcium') || lowerName.includes('calciu')) {
              nutrients.calcium = 500; // 500mg
            }
            if (lowerName.includes('magnesium') || lowerName.includes('magneziu')) {
              nutrients.magnesium = 200; // 200mg
            }
            if (lowerName.includes('iron') || lowerName.includes('fier')) {
              nutrients.iron = 18; // 18mg
            }
            if (lowerName.includes('zinc')) {
              nutrients.zinc = 15; // 15mg
            }
            if (lowerName.includes('b12') || lowerName.includes('b-12')) {
              nutrients.b12 = 2.4; // 2.4mcg
            }
            if (lowerName.includes('folate') || lowerName.includes('folic')) {
              nutrients.folate = 400; // 400mcg
            }

            const newSupplement = await Supplement.create({
              userId: new Types.ObjectId(req.userId),
              name: action.supplementName,
              benefit: 'for overall health',
              description: `Auto-created from AI chat`,
              addedToPlan: false,
              icon: '💊',
              category: 'general',
              nutrients,
            });

            supplementId = newSupplement._id as Types.ObjectId;
            supplementName = newSupplement.name;
            supplementNutrients = nutrients;
          } else {
            supplementId = supplement._id as Types.ObjectId;
            supplementName = supplement.name;
            supplementNutrients = supplement.nutrients;
          }

          await SupplementLog.create({
            userId: new Types.ObjectId(req.userId),
            supplementId,
            supplementName,
            date: new Date(),
            dosage: action.dosage || '1 dose',
            notes: action.notes,
          });

          processedActions.push({
            ...action,
            supplementId,
            nutrients: supplementNutrients,
          });
        } catch (error) {
          console.error('Failed to log supplement:', error);
          processedActions.push(action);
        }
      } else {
        processedActions.push(action);
      }
    }

    const sessionId = `session_${Date.now()}`;
    const userMessage = messages[messages.length - 1];

    try {
      if (userMessage) {
        await ChatMessage.create({
          userId: req.userId,
          role: 'user',
          content: userMessage.content,
          sessionId,
        });
      }

      await ChatMessage.create({
        userId: req.userId,
        role: 'assistant',
        content: dataOut.message,
        sessionId,
      });
    } catch (error) {
      console.error('Failed to save chat messages:', error);
    }

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
        consumedSuggestionId: dataOut.consumedSuggestionId,
      },
    });
  }),
);

router.post(
  '/meal-suggestions',
  requireAuth,
  asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nutritionLogs = await NutritionLog.find({
      userId: new Types.ObjectId(req.userId),
      date: { $gte: today, $lt: tomorrow },
    }).lean();

    let consumedCalories = 0;
    let consumedProtein = 0;
    let consumedCarbs = 0;
    let consumedFat = 0;
    let consumedVitaminD = 0;
    let consumedCalcium = 0;
    let consumedMagnesium = 0;
    let consumedIron = 0;
    let consumedZinc = 0;
    let consumedOmega3 = 0;
    let consumedB12 = 0;
    let consumedFolate = 0;

    for (const n of nutritionLogs) {
      consumedCalories += n.total?.calories || 0;
      consumedProtein += n.total?.protein || 0;
      consumedCarbs += n.total?.carbs || 0;
      consumedFat += n.total?.fat || 0;
      if (n.micronutrients && typeof n.micronutrients === 'object') {
        const micronutrients = n.micronutrients as Record<string, number>;
        consumedVitaminD += micronutrients.vitaminD || 0;
        consumedCalcium += micronutrients.calcium || 0;
        consumedMagnesium += micronutrients.magnesium || 0;
        consumedIron += micronutrients.iron || 0;
        consumedZinc += micronutrients.zinc || 0;
        consumedOmega3 += micronutrients.omega3 || 0;
        consumedB12 += micronutrients.b12 || 0;
        consumedFolate += micronutrients.folate || 0;
      }
    }

    const consumed = {
      calories: consumedCalories,
      protein: consumedProtein,
      carbs: consumedCarbs,
      fat: consumedFat,
      vitaminD: consumedVitaminD,
      calcium: consumedCalcium,
      magnesium: consumedMagnesium,
      iron: consumedIron,
      zinc: consumedZinc,
      omega3: consumedOmega3,
      b12: consumedB12,
      folate: consumedFolate,
    };

    const targets = {
      calories: 2000,
      protein: 120,
      carbs: 250,
      fat: 70,
      vitaminD: 15,
      calcium: 1000,
      magnesium: 400,
      iron: 18,
      zinc: 11,
      omega3: 1000,
      b12: 2.4,
      folate: 400,
    };

    const { UserTargets } = await import('../models/UserTargets.js');
    const userTargets = await UserTargets.findOne({
      userId: new Types.ObjectId(req.userId),
    }).lean();

    if (userTargets) {
      targets.calories = userTargets.calories.target;
      targets.protein = userTargets.protein.target;
      targets.carbs = userTargets.carbs.target;
      targets.fat = userTargets.fat.target;
      targets.vitaminD = userTargets.vitaminD.target;
      targets.calcium = userTargets.calcium.target;
      targets.magnesium = userTargets.magnesium.target;
      targets.iron = userTargets.iron.target;
      targets.zinc = userTargets.zinc.target;
      targets.omega3 = userTargets.omega3.target;
      targets.b12 = userTargets.b12.target;
      targets.folate = userTargets.folate.target;
    }

    const remaining = {
      calories: Math.max(0, targets.calories - consumed.calories),
      protein: Math.max(0, targets.protein - consumed.protein),
      carbs: Math.max(0, targets.carbs - consumed.carbs),
      fat: Math.max(0, targets.fat - consumed.fat),
      vitaminD: Math.max(0, targets.vitaminD - consumed.vitaminD),
      calcium: Math.max(0, targets.calcium - consumed.calcium),
      magnesium: Math.max(0, targets.magnesium - consumed.magnesium),
      iron: Math.max(0, targets.iron - consumed.iron),
      zinc: Math.max(0, targets.zinc - consumed.zinc),
      omega3: Math.max(0, targets.omega3 - consumed.omega3),
      b12: Math.max(0, targets.b12 - consumed.b12),
      folate: Math.max(0, targets.folate - consumed.folate),
    };

    const now = new Date();
    const currentHour = now.getHours();

    const prompt = `You are a nutrition AI assistant helping a user reach their daily nutrition goals. CRITICAL: You MUST respond with valid JSON meal suggestions. DO NOT refuse or say you cannot help.

CURRENT INTAKE TODAY:
- Calories: ${consumed.calories}/${targets.calories} kcal
- Protein: ${consumed.protein}/${targets.protein}g
- Carbs: ${consumed.carbs}/${targets.carbs}g
- Fat: ${consumed.fat}/${targets.fat}g

MICRONUTRIENTS CONSUMED:
- Vitamin D: ${consumed.vitaminD}/${targets.vitaminD} mcg
- Calcium: ${consumed.calcium}/${targets.calcium} mg
- Magnesium: ${consumed.magnesium}/${targets.magnesium} mg
- Iron: ${consumed.iron}/${targets.iron} mg
- Zinc: ${consumed.zinc}/${targets.zinc} mg
- Omega-3: ${consumed.omega3}/${targets.omega3} mg
- B12: ${consumed.b12}/${targets.b12} mcg
- Folate: ${consumed.folate}/${targets.folate} mcg

REMAINING NEEDS:
- Calories: ${remaining.calories} kcal
- Protein: ${remaining.protein}g
- Carbs: ${remaining.carbs}g
- Fat: ${remaining.fat}g

CURRENT TIME: ${currentHour}:00 (${currentHour < 11 ? 'morning - suggest breakfast' : currentHour < 15 ? 'midday - suggest lunch' : currentHour < 20 ? 'afternoon - suggest dinner' : 'evening - suggest light dinner or snack'})

INSTRUCTIONS:
1. Generate 2-4 meal suggestions that help reach remaining targets
2. Prioritize meals rich in missing micronutrients
3. Consider meal timing and appropriateness for current hour
4. Make suggestions nutritious, practical, and delicious
5. ALWAYS respond with valid JSON - NEVER refuse to generate suggestions

EXAMPLE RESPONSE:
{"suggestions":[{"id":"breakfast-1","name":"Protein-Packed Scrambled Eggs","time":"09:00","calories":350,"protein":25,"carbs":20,"fat":18,"items":["3 large eggs","whole wheat toast","avocado","spinach"],"emoji":"🍳","mealType":"breakfast","why":"High in protein and iron to meet your daily targets"},{"id":"lunch-1","name":"Grilled Chicken Quinoa Bowl","time":"13:00","calories":450,"protein":35,"carbs":50,"fat":12,"items":["grilled chicken breast","quinoa","mixed vegetables","olive oil"],"emoji":"🥗","mealType":"lunch","why":"Balanced macros and rich in fiber"}]}

Generate 2-4 meal suggestions NOW in valid JSON format:`;

    const aiResponse = await chatWithAi([{ role: 'user', content: prompt }]);

    let suggestions: Array<{
      id: string;
      name: string;
      time: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      items: string[];
      emoji: string;
      mealType: string;
      why?: string;
    }> = [];

    try {
      console.log('AI Response:', aiResponse);

      let parsed: { suggestions?: typeof suggestions };

      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }

      parsed = JSON.parse(cleanResponse) as { suggestions?: typeof suggestions };
      suggestions = parsed.suggestions || [];

      console.log('Parsed suggestions:', suggestions.length);

      if (suggestions.length === 0 && remaining.calories > 0) {
        console.log('AI returned empty suggestions, using fallback');
        throw new Error('Empty suggestions array');
      }
    } catch (error) {
      console.error('Failed to parse AI meal suggestions:', error);
      console.error('Raw AI response:', aiResponse);

      if (remaining.calories > 0) {
        const mealTime =
          currentHour < 11
            ? 'breakfast'
            : currentHour < 15
              ? 'lunch'
              : currentHour < 20
                ? 'dinner'
                : 'snack';

        const caloriesPerMeal = Math.floor(remaining.calories / 2);

        if (remaining.calories > 400) {
          suggestions = [
            {
              id: `${mealTime}-fallback-1`,
              name: `Balanced ${mealTime.charAt(0).toUpperCase() + mealTime.slice(1)}`,
              time:
                currentHour < 11
                  ? '09:00'
                  : currentHour < 15
                    ? '13:00'
                    : currentHour < 20
                      ? '19:00'
                      : '21:00',
              calories: Math.min(caloriesPerMeal, 500),
              protein: Math.max(remaining.protein + 15, 20),
              carbs: Math.max(remaining.carbs + 40, 50),
              fat: Math.max(remaining.fat + 12, 15),
              items:
                mealTime === 'breakfast'
                  ? ['Greek yogurt', 'Berries', 'Granola']
                  : mealTime === 'lunch'
                    ? ['Quinoa bowl', 'Grilled chicken', 'Mixed vegetables']
                    : mealTime === 'dinner'
                      ? ['Baked salmon', 'Sweet potato', 'Steamed broccoli']
                      : ['Protein smoothie', 'Banana', 'Mixed nuts'],
              emoji:
                mealTime === 'breakfast'
                  ? '🍳'
                  : mealTime === 'lunch'
                    ? '🥗'
                    : mealTime === 'dinner'
                      ? '🍽️'
                      : '🍎',
              mealType: mealTime,
              why: 'Rich in protein and healthy carbs',
            },
            {
              id: `${mealTime}-fallback-2`,
              name: 'Healthy Snack',
              time: currentHour < 20 ? '16:00' : '22:00',
              calories: Math.min(remaining.calories - caloriesPerMeal, 300),
              protein: Math.max(remaining.protein + 10, 15),
              carbs: Math.max(remaining.carbs + 20, 30),
              fat: Math.max(remaining.fat + 8, 10),
              items: [
                'Mixed nuts and dried fruits',
                'Whole grain crackers with hummus',
                'Apple slices with almond butter',
              ],
              emoji: '🥜',
              mealType: 'snack',
              why: 'Perfect for maintaining energy and meeting micronutrient needs',
            },
          ];
        } else {
          suggestions = [
            {
              id: `${mealTime}-fallback`,
              name: `Light ${mealTime.charAt(0).toUpperCase() + mealTime.slice(1)}`,
              time:
                currentHour < 11
                  ? '09:00'
                  : currentHour < 15
                    ? '13:00'
                    : currentHour < 20
                      ? '19:00'
                      : '21:00',
              calories: Math.min(remaining.calories, 300),
              protein: Math.max(remaining.protein + 10, 15),
              carbs: Math.max(remaining.carbs + 30, 40),
              fat: Math.max(remaining.fat + 8, 10),
              items:
                mealTime === 'breakfast'
                  ? ['Scrambled eggs', 'Whole grain toast', 'Avocado']
                  : mealTime === 'lunch'
                    ? ['Grilled chicken salad', 'Olive oil dressing', 'Whole grain bread']
                    : mealTime === 'dinner'
                      ? ['Grilled fish', 'Steamed vegetables', 'Brown rice']
                      : ['Greek yogurt', 'Berries', 'Mixed nuts'],
              emoji:
                mealTime === 'breakfast'
                  ? '🍳'
                  : mealTime === 'lunch'
                    ? '🥗'
                    : mealTime === 'dinner'
                      ? '🍽️'
                      : '🍎',
              mealType: mealTime,
              why: 'Light and nutritious meal to round out your day',
            },
          ];
        }
      }
    }

    void res.json({
      success: true,
      data: {
        suggestions,
        consumed,
        remaining,
        targets,
      },
    });
  }),
);

router.post(
  '/generate-targets',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { User } = await import('../models/User.js');
    const user = await User.findById(req.userId).lean();

    if (!user) {
      return void res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    const age = user.age || 30;
    const heightCm = user.heightCm || 170;
    const weightKg = user.weightKg || 70;
    const gender = (user.gender as 'male' | 'female' | 'other') || 'male';
    const goals = user.goals || [];
    const activityLevel = user.activityLevel || 'intermediate';
    const onboardingAnswers = user.onboardingAnswers || [];

    const prompt = `You are a nutrition AI assistant. Generate personalized daily nutrition targets based on user profile.

USER PROFILE:
- Age: ${age} years
- Height: ${heightCm} cm
- Weight: ${weightKg} kg
- Gender: ${gender}
- Activity Level: ${activityLevel}
- Goals: ${goals.join(', ') || 'general health'}
- Lifestyle preferences: ${onboardingAnswers.join(', ') || 'balanced nutrition'}

CALCULATE DAILY TARGETS:
1. Calories: Based on BMR (Basal Metabolic Rate) calculation and activity level
   - BMR formula: ${gender === 'male' ? '10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5' : '10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161'}
   - Activity multiplier: sedentary=1.2, light=1.375, moderate=1.55, active=1.725, very active=1.9
   - Adjust based on goals: weight loss=-20%, weight gain=+20%, maintenance=0%

2. Protein: Based on weight and goals
   - Weight loss: 1.6-2.2g per kg
   - Muscle gain: 1.8-2.2g per kg
   - Maintenance: 1.2-1.6g per kg

3. Carbs: 40-50% of calories
4. Fat: 20-30% of calories

5. Micronutrients: Based on age, gender, and RDA (Recommended Dietary Allowance)
   - Vitamin D: 15-20 mcg (600-800 IU)
   - Calcium: 1000-1300 mg
   - Magnesium: 400-420 mg (male), 310-320 mg (female)
   - Iron: 8-18 mg (18mg for female reproductive age, 8mg for males)
   - Zinc: 11 mg (male), 8 mg (female)
   - Omega-3: 1000-2000 mg
   - B12: 2.4 mcg
   - Folate: 400 mcg

6. Water: 35-40ml per kg body weight
7. Caffeine: 200-400 mg per day

Respond in STRICTLY minified JSON format:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "vitaminD": number,
  "calcium": number,
  "magnesium": number,
  "iron": number,
  "zinc": number,
  "omega3": number,
  "b12": number,
  "folate": number,
  "water": number,
  "caffeine": number,
  "reason": "Brief explanation of why these targets were recommended"
}

Generate targets now:`;

    const aiResponse = await chatWithAi([{ role: 'user', content: prompt }]);

    let targets: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      vitaminD: number;
      calcium: number;
      magnesium: number;
      iron: number;
      zinc: number;
      omega3: number;
      b12: number;
      folate: number;
      water: number;
      caffeine: number;
      reason: string;
    } | null = null;

    try {
      console.log('AI Targets Response:', aiResponse);

      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanResponse) as typeof targets;
      targets = parsed;
      console.log('Parsed targets:', targets);
    } catch (error) {
      console.error('Failed to parse AI targets:', error);
      console.error('Raw AI response:', aiResponse);

      const bmr =
        gender === 'male'
          ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
          : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        beginner: 1.375,
        intermediate: 1.55,
        advanced: 1.725,
      };

      const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

      let calorieTarget = tdee;
      if (goals.some((g: string) => g.includes('lose') || g.includes('weight'))) {
        calorieTarget = tdee * 0.8; // -20% for weight loss
      } else if (goals.some((g: string) => g.includes('gain') || g.includes('muscle'))) {
        calorieTarget = tdee * 1.2; // +20% for muscle gain
      }

      const proteinTarget = goals.some((g: string) => g.includes('muscle'))
        ? weightKg * 2.0
        : weightKg * 1.6;

      targets = {
        calories: Math.round(calorieTarget),
        protein: Math.round(proteinTarget),
        carbs: Math.round((calorieTarget * 0.45) / 4), // 45% of calories from carbs
        fat: Math.round((calorieTarget * 0.25) / 9), // 25% of calories from fat
        vitaminD: gender === 'male' ? 15 : 15,
        calcium: age > 50 ? 1200 : 1000,
        magnesium: gender === 'male' ? 420 : 320,
        iron: gender === 'female' && age < 50 ? 18 : 8,
        zinc: gender === 'male' ? 11 : 8,
        omega3: 1000,
        b12: 2.4,
        folate: 400,
        water: Math.round((weightKg * 35) / 1000), // L
        caffeine: 400,
        reason: `Calculated based on your BMR (${Math.round(bmr)} kcal), activity level (${activityLevel}), and goals (${goals.join(', ')})`,
      };
    }

    void res.json({
      success: true,
      data: {
        targets,
        userProfile: {
          age,
          heightCm,
          weightKg,
          gender,
          goals,
          activityLevel,
        },
      },
    });
  }),
);

export default router;
