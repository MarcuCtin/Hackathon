import { Log, type LogDoc } from '../models/Log.js';
import { NutritionLog, type NutritionLogDoc } from '../models/NutritionLog.js';

export async function generateAdaptiveSuggestions(userId: string): Promise<string[]> {
  // Simple heuristic baseline; later enriched with LLM context
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const [recentWorkout, recentSleep, todayNutrition] = await Promise.all([
    Log.findOne({ userId, type: 'workout' }).sort({ date: -1 }).lean(),
    Log.findOne({ userId, type: 'sleep' }).sort({ date: -1 }).lean(),
    NutritionLog.find({ userId, date: { $gte: startOfDay, $lt: endOfDay } }).lean(),
  ]);

  const suggestions: string[] = [];

  if (!recentWorkout || Date.now() - new Date(recentWorkout.date).getTime() > 36 * 3600 * 1000) {
    suggestions.push('Plan a 20–30 minute light workout today.');
  }

  if (!recentSleep || (recentSleep.value ?? 0) < 7) {
    suggestions.push('Aim for at least 7 hours of sleep tonight.');
  }

  const totals = todayNutrition.reduce(
    (acc, n) => ({
      calories: acc.calories + n.total.calories,
      protein: acc.protein + n.total.protein,
      carbs: acc.carbs + n.total.carbs,
      fat: acc.fat + n.total.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  if (totals.protein < 60) suggestions.push('Add a protein-rich snack to reach protein goals.');
  if (totals.calories < 1500) suggestions.push('Consider a balanced meal to meet energy needs.');

  if (suggestions.length === 0) suggestions.push('Great progress today. Keep it up!');

  return suggestions;
}
