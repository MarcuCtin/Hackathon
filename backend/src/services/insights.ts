import { NutritionLog } from '../models/NutritionLog.js';
import { Log } from '../models/Log.js';
import { DailySummary } from '../models/DailySummary.js';

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function aggregateDailyForUser(userId: string, day: Date): Promise<void> {
  const start = startOfDay(day);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);

  const [nutrition, workouts, sleep, steps] = await Promise.all([
    NutritionLog.find({ userId, date: { $gte: start, $lt: end } }).lean(),
    Log.find({ userId, type: 'workout', date: { $gte: start, $lt: end } }).lean(),
    Log.find({ userId, type: 'sleep', date: { $gte: start, $lt: end } }).lean(),
    Log.find({ userId, type: 'steps', date: { $gte: start, $lt: end } }).lean(),
  ]);

  const totals = nutrition.reduce(
    (acc, n) => ({
      calories: acc.calories + n.total.calories,
      protein: acc.protein + n.total.protein,
      carbs: acc.carbs + n.total.carbs,
      fat: acc.fat + n.total.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const logs = {
    workouts: workouts.length,
    sleepHours: sleep.reduce((s, l) => s + (l.value || 0), 0),
    steps: steps.reduce((s, l) => s + (l.value || 0), 0),
  };

  const insights: string[] = [];
  if (logs.sleepHours < 7) insights.push('Sleep under 7h; prioritize rest.');
  if (logs.workouts === 0) insights.push('No workout logged; consider light activity.');
  if (totals.protein < 60) insights.push('Protein intake below 60g; add lean protein.');

  await DailySummary.findOneAndUpdate(
    { userId, date: start },
    { $set: { totals, logs, insights } },
    { upsert: true },
  );
}

export async function getRecentInsights(userId: string): Promise<unknown[]> {
  return DailySummary.find({ userId }).sort({ date: -1 }).limit(14).lean();
}
