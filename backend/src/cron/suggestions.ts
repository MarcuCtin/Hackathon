import { User } from '../models/User.js';
import { Suggestion } from '../models/Suggestion.js';
import { Log } from '../models/Log.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { chatWithAi } from '../services/gemini.js';

export async function generateDailySuggestions() {
  console.log('Starting daily suggestions generation...');

  try {
    const users = await User.find({
      completedOnboarding: true,
    }).lean();

    console.log(`Found ${users.length} users for suggestions generation`);

    for (const user of users) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingSuggestions = await Suggestion.countDocuments({
          userId: user._id,
          status: 'active',
          generatedAt: { $gte: today },
        });

        if (existingSuggestions > 0) {
          console.log(`User ${user._id} already has suggestions for today`);
          continue;
        }

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const [recentLogs, recentNutrition] = await Promise.all([
          Log.find({
            userId: user._id,
            date: { $gte: weekAgo },
          }).lean(),
          NutritionLog.find({
            userId: user._id,
            date: { $gte: weekAgo },
          }).lean(),
        ]);

        const todayLogs = recentLogs.filter(
          (log) => new Date(log.date).getTime() >= today.getTime(),
        );

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

        const aiResponse = await chatWithAi([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate personalized wellness suggestions for today.' },
        ]);

        const suggestions = JSON.parse(aiResponse) as Array<{
          title: string;
          description: string;
          category: string;
          priority: string;
          emoji: string;
          actionText?: string;
          dismissText?: string;
        }>;

        await Promise.all(
          suggestions.map((suggestion) =>
            Suggestion.create({
              userId: user._id,
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

        console.log(`Generated ${suggestions.length} suggestions for user ${user._id}`);
      } catch (userError) {
        console.error(`Error generating suggestions for user ${user._id}:`, userError);
      }
    }

    console.log('Daily suggestions generation completed');
  } catch (error) {
    console.error('Error in daily suggestions generation:', error);
  }
}

export async function cleanupExpiredSuggestions() {
  console.log('Cleaning up expired suggestions...');

  try {
    const result = await Suggestion.updateMany(
      {
        status: 'active',
        expiresAt: { $lt: new Date() },
      },
      {
        status: 'dismissed',
        dismissedAt: new Date(),
      },
    );

    console.log(`Cleaned up ${result.modifiedCount} expired suggestions`);
  } catch (error) {
    console.error('Error cleaning up expired suggestions:', error);
  }
}
