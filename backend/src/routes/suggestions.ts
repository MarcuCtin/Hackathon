import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Suggestion } from '../models/Suggestion.js';
import { User } from '../models/User.js';
import { Log } from '../models/Log.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { chatWithAi } from '../services/gemini.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const suggestions = await Suggestion.find({
      userId: req.userId,
      status: 'active',
    })
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    void res.json({ success: true, data: suggestions });
  }),
);

router.post(
  '/:id/complete',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const suggestion = await Suggestion.findOneAndUpdate(
      { _id: id, userId: req.userId },
      {
        status: 'completed',
        completedAt: new Date(),
      },
      { new: true },
    );

    if (!suggestion) {
      return void res.status(404).json({
        success: false,
        error: { message: 'Suggestion not found' },
      });
    }

    void res.json({ success: true, data: suggestion });
  }),
);

router.post(
  '/:id/dismiss',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const suggestion = await Suggestion.findOneAndUpdate(
      { _id: id, userId: req.userId },
      {
        status: 'dismissed',
        dismissedAt: new Date(),
      },
      { new: true },
    );

    if (!suggestion) {
      return void res.status(404).json({
        success: false,
        error: { message: 'Suggestion not found' },
      });
    }

    void res.json({ success: true, data: suggestion });
  }),
);

router.post(
  '/generate',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).lean();
    if (!user) {
      return void res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [recentLogs, recentNutrition] = await Promise.all([
      Log.find({
        userId: req.userId,
        date: { $gte: weekAgo },
      }).lean(),
      NutritionLog.find({
        userId: req.userId,
        date: { $gte: weekAgo },
      }).lean(),
    ]);

    const todayLogs = recentLogs.filter((log) => new Date(log.date).getTime() >= today.getTime());

    const hydrationToday = todayLogs
      .filter((log) => log.type === 'hydration')
      .reduce((sum, log) => sum + (log.value || 0), 0);

    const sleepToday = todayLogs
      .filter((log) => log.type === 'sleep')
      .reduce((sum, log) => sum + (log.value || 0), 0);

    const workoutToday = todayLogs
      .filter((log) => log.type === 'workout')
      .reduce((sum, log) => sum + (log.value || 0), 0);

    const caloriesToday = recentNutrition
      .filter((meal) => new Date(meal.date).getTime() >= today.getTime())
      .reduce((sum, meal) => sum + (meal.total?.calories || 0), 0);

    const systemPrompt = `You are Fitter AI, a wellness coach. Generate 3-5 personalized daily suggestions based on user data.

User Profile:
- Goals: ${user.goals?.join(', ') || 'general wellness'}
- Age: ${user.age || 'not specified'}
- Height: ${user.heightCm || 'not specified'}cm
- Weight: ${user.weightKg || 'not specified'}kg

Today's Activity:
- Hydration: ${hydrationToday} glasses
- Sleep: ${sleepToday} hours
- Workout: ${workoutToday} calories
- Calories consumed: ${caloriesToday}

Generate suggestions that are:
1. Specific and actionable
2. Based on their current activity levels
3. Helpful for their goals
4. Varied across categories (nutrition, exercise, sleep, hydration, wellness)

Return ONLY a JSON array with this exact format:
[
  {
    "title": "Brief suggestion title",
    "description": "Detailed explanation of the suggestion",
    "category": "nutrition|exercise|sleep|hydration|wellness|recovery",
    "priority": "high|medium|low",
    "emoji": "🏋️‍♂️",
    "actionText": "I'll do it",
    "dismissText": "Dismiss"
  }
]`;

    try {
      const aiResponse = await chatWithAi([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate personalized wellness suggestions for today.' },
      ]);

      let suggestions: Array<{
        title: string;
        description: string;
        category: string;
        priority: string;
        emoji: string;
        actionText?: string;
        dismissText?: string;
      }>;
      try {
        suggestions = JSON.parse(aiResponse) as Array<{
          title: string;
          description: string;
          category: string;
          priority: string;
          emoji: string;
          actionText?: string;
          dismissText?: string;
        }>;
      } catch (parseError) {
        console.error('Failed to parse AI suggestions:', parseError);
        return void res.status(500).json({
          success: false,
          error: { message: 'Failed to generate suggestions' },
        });
      }

      const savedSuggestions = await Promise.all(
        suggestions.map((suggestion) =>
          Suggestion.create({
            userId: req.userId,
            title: suggestion.title,
            description: suggestion.description,
            category: suggestion.category as
              | 'nutrition'
              | 'exercise'
              | 'sleep'
              | 'hydration'
              | 'wellness'
              | 'recovery',
            priority: suggestion.priority as 'high' | 'medium' | 'low',
            emoji: suggestion.emoji,
            actionText: suggestion.actionText,
            dismissText: suggestion.dismissText,
            generatedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          }),
        ),
      );

      void res.json({ success: true, data: savedSuggestions });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      void res.status(500).json({
        success: false,
        error: { message: 'Failed to generate suggestions' },
      });
    }
  }),
);

router.get(
  '/history',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { limit = 50, status } = req.query;

    const query: Record<string, unknown> = { userId: req.userId };
    if (status) {
      query.status = status;
    }

    const suggestions = await Suggestion.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    void res.json({ success: true, data: suggestions });
  }),
);

export default router;
