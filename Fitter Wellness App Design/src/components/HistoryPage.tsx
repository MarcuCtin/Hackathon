// @ts-nocheck
import { useMemo, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { FitterLogo } from "./FitterLogo";
import { UserAvatar } from "./UserAvatar";
import {
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  CheckCircle2,
  Zap,
  Heart,
  Moon,
  Apple,
  Activity,
  Brain,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Droplet,
  Utensils,
} from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useActivityData } from "../context/ActivityContext";
import { DayCard } from "./DayCard";
import { api } from "../lib/api";
import { toast } from "sonner";

interface DayData {
  date: string;
  calories: { consumed: number; target: number };
  protein: { consumed: number; target: number };
  water: { consumed: number; target: number };
  sleep: { hours: number; quality: "good" | "fair" | "poor" };
  mood: "calm" | "stressed" | "focused" | "energized";
  workouts: number;
  steps: number;
  achievements: string[];
}

interface HistoryPageProps {
  onProfileClick?: () => void;
  onNavigate?: (view: string, params?: any) => void;
}

export function HistoryPage({ onProfileClick, onNavigate }: HistoryPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [wellnessHistory, setWellnessHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    logs,
    nutritionLogs,
    hydrationToday,
    workoutCaloriesToday,
    sleepHoursToday,
    mealCountToday,
  } = useActivityData();

  // Generate last 7 days for wellness history
  useEffect(() => {
    const generateWellnessHistory = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const historyPromises = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          try {
            const response = await api.getDailyWellness(dateStr);
            historyPromises.push(response.data);
          } catch (error) {
            // If no data for this day, create empty data
            historyPromises.push({
              date: dateStr,
              wellness: { score: 0, energyLevel: 0, hydration: 0, sleepHours: 0 },
              movement: { workoutCalories: 0, steps: 0, activeMinutes: 0 },
              nutrition: { totalCalories: 0, totalProtein: 0, mealCount: 0 }
            });
          }
        }
        
        const history = await Promise.all(historyPromises);
        setWellnessHistory(history);
      } catch (error) {
        console.error("Failed to fetch wellness history:", error);
        toast.error("Failed to load wellness history.");
      } finally {
        setLoading(false);
      }
    };

    generateWellnessHistory();
  }, []);

  const handleViewDayDetails = (date: string) => {
    // Navigate to day details page
    if (onNavigate) {
      onNavigate('dayinfo', { date });
    } else {
      // Fallback to URL navigation
      const dayInfoUrl = `/dayinfo/${date}`;
      window.history.pushState({}, '', dayInfoUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const activityTimeline = useMemo(() => {
    const entries: Array<{
      id: string;
      type: string;
      title: string;
      subtitle: string;
      timestamp: string;
    }> = [];

    (logs || []).forEach((log) => {
      const labels: Record<string, string> = {
        hydration: "Hydration logged",
        sleep: "Sleep recorded",
        workout: "Workout logged",
      };

      const subtitle = (() => {
        if (log.type === "hydration") {
          return `${log.value}${log.unit ? ` ${log.unit}` : ""}`;
        }
        if (log.type === "sleep") {
          return `${log.value} hours${log.note ? ` · ${log.note}` : ""}`;
        }
        if (log.type === "workout") {
          return `${log.value} kcal${log.note ? ` · ${log.note}` : ""}`;
        }
        return `${log.value}${log.unit ? ` ${log.unit}` : ""}`;
      })();

      entries.push({
        id: `log-${log._id}`,
        type: log.type,
        title: labels[log.type] || "Activity",
        subtitle,
        timestamp: log.date,
      });
    });

    (nutritionLogs || []).forEach((meal) => {
      const calories = meal.total?.calories ?? 0;
      const title = `Meal logged • ${meal.mealType}`;
      const name = meal.items?.[0]?.name || "Meal";

      entries.push({
        id: `meal-${meal._id}`,
        type: "meal",
        title,
        subtitle: `${name}${calories ? ` · ${calories} kcal` : ""}`,
        timestamp: meal.date,
      });
    });

    return entries.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [logs, nutritionLogs]);

  // Mock data for last 7 days
  const historyData: DayData[] = [
    {
      date: "2025-10-21",
      calories: { consumed: 2150, target: 2200 },
      protein: { consumed: 118, target: 120 },
      water: { consumed: 3.0, target: 3.0 },
      sleep: { hours: 7.5, quality: "good" },
      mood: "focused",
      workouts: 1,
      steps: 9500,
      achievements: ["Hit protein goal", "Perfect hydration"],
    },
    {
      date: "2025-10-20",
      calories: { consumed: 2100, target: 2200 },
      protein: { consumed: 115, target: 120 },
      water: { consumed: 2.8, target: 3.0 },
      sleep: { hours: 8, quality: "good" },
      mood: "calm",
      workouts: 2,
      steps: 12000,
      achievements: ["10k+ steps", "Great sleep"],
    },
    {
      date: "2025-10-19",
      calories: { consumed: 2300, target: 2200 },
      protein: { consumed: 125, target: 120 },
      water: { consumed: 3.2, target: 3.0 },
      sleep: { hours: 6.5, quality: "fair" },
      mood: "energized",
      workouts: 1,
      steps: 8200,
      achievements: ["Extra protein", "Stayed active"],
    },
    {
      date: "2025-10-18",
      calories: { consumed: 1950, target: 2200 },
      protein: { consumed: 105, target: 120 },
      water: { consumed: 2.5, target: 3.0 },
      sleep: { hours: 7, quality: "fair" },
      mood: "stressed",
      workouts: 0,
      steps: 6500,
      achievements: ["Consistent tracking"],
    },
    {
      date: "2025-10-17",
      calories: { consumed: 2200, target: 2200 },
      protein: { consumed: 120, target: 120 },
      water: { consumed: 3.0, target: 3.0 },
      sleep: { hours: 8, quality: "good" },
      mood: "calm",
      workouts: 2,
      steps: 11000,
      achievements: ["Perfect day", "All goals met", "Double workout"],
    },
    {
      date: "2025-10-16",
      calories: { consumed: 2050, target: 2200 },
      protein: { consumed: 110, target: 120 },
      water: { consumed: 2.7, target: 3.0 },
      sleep: { hours: 7.5, quality: "good" },
      mood: "focused",
      workouts: 1,
      steps: 9000,
      achievements: ["Good sleep", "Workout completed"],
    },
    {
      date: "2025-10-15",
      calories: { consumed: 2180, target: 2200 },
      protein: { consumed: 122, target: 120 },
      water: { consumed: 3.1, target: 3.0 },
      sleep: { hours: 7, quality: "good" },
      mood: "energized",
      workouts: 1,
      steps: 10500,
      achievements: ["Protein boost", "Great hydration"],
    },
  ];

  // Calculate weekly stats
  const weeklyStats = {
    avgCalories: Math.round(
      historyData.reduce((sum, d) => sum + d.calories.consumed, 0) / historyData.length
    ),
    avgProtein: Math.round(
      historyData.reduce((sum, d) => sum + d.protein.consumed, 0) / historyData.length
    ),
    avgSleep: (
      historyData.reduce((sum, d) => sum + d.sleep.hours, 0) / historyData.length
    ).toFixed(1),
    totalWorkouts: historyData.reduce((sum, d) => sum + d.workouts, 0),
    goalsHit: historyData.filter(
      (d) =>
        d.calories.consumed >= d.calories.target * 0.95 &&
        d.protein.consumed >= d.protein.target * 0.95
    ).length,
    totalAchievements: historyData.reduce((sum, d) => sum + d.achievements.length, 0),
  };

  const improvements = [
    {
      metric: "Sleep Quality",
      change: "+15%",
      trend: "up",
      description: "Better rest compared to last week",
      icon: Moon,
      gradient: "from-indigo-400 to-purple-400",
    },
    {
      metric: "Protein Intake",
      change: "+8%",
      trend: "up",
      description: "More consistent protein goals",
      icon: Zap,
      gradient: "from-amber-400 to-orange-400",
    },
    {
      metric: "Workout Frequency",
      change: "+2 sessions",
      trend: "up",
      description: "Increased activity level",
      icon: Activity,
      gradient: "from-emerald-400 to-teal-400",
    },
    {
      metric: "Stress Levels",
      change: "-12%",
      trend: "down",
      description: "Better emotional balance",
      icon: Heart,
      gradient: "from-rose-400 to-pink-400",
    },
  ];

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "calm":
        return "😌";
      case "stressed":
        return "😰";
      case "focused":
        return "🎯";
      case "energized":
        return "⚡";
      default:
        return "😊";
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "calm":
        return "from-blue-400 to-cyan-400";
      case "stressed":
        return "from-red-400 to-orange-400";
      case "focused":
        return "from-emerald-400 to-teal-400";
      case "energized":
        return "from-amber-400 to-yellow-400";
      default:
        return "from-slate-400 to-slate-500";
    }
  };

  const getSleepQualityColor = (quality: string) => {
    switch (quality) {
      case "good":
        return "from-emerald-400 to-teal-400";
      case "fair":
        return "from-amber-400 to-orange-400";
      case "poor":
        return "from-red-400 to-rose-400";
      default:
        return "from-slate-400 to-slate-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FitterLogo size={36} />
              <div>
                <h3 className="text-slate-900">History</h3>
                <p className="text-slate-500">Your wellness journey</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-0">
                🔥 {workoutCaloriesToday} kcal
              </Badge>
              <Badge className="rounded-full bg-gradient-to-r from-sky-100 to-blue-100 text-blue-700 border-0">
                💧 {hydrationToday}
              </Badge>
              <Badge className="rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-0">
                🛌 {sleepHoursToday ?? "-"} h
              </Badge>
              <Badge className="rounded-full bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border-0">
                🥗 {mealCountToday}
              </Badge>
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                onClick={() => setViewMode("week")}
                className="rounded-2xl"
              >
                Week
              </Button>
              <Button
                variant={viewMode === "month" ? "default" : "outline"}
                onClick={() => setViewMode("month")}
                className="rounded-2xl"
              >
                Month
              </Button>
              <button onClick={onProfileClick} className="focus:outline-none ml-2">
                <UserAvatar size={36} userName="Alex Thompson" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-6 rounded-3xl border-white/20 bg-white/70 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3>Assistant Timeline</h3>
                  <p className="text-slate-500">Latest AI-driven entries</p>
                </div>
              </div>
              <Badge className="rounded-full bg-slate-100 text-slate-600 border-0">
                {activityTimeline.length ? `${activityTimeline.length} updates` : "No data yet"}
              </Badge>
            </div>

            <div className="space-y-4">
              {activityTimeline.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
                  Start a conversation with the assistant to populate your history with real actions.
                </div>
              )}

              {activityTimeline.slice(0, 12).map((entry) => {
                const iconMap = {
                  hydration: Droplet,
                  sleep: Moon,
                  workout: Activity,
                  meal: Apple,
                } as const;
                const backgroundMap: Record<string, string> = {
                  hydration: "from-sky-100 to-blue-100",
                  sleep: "from-indigo-100 to-purple-100",
                  workout: "from-amber-100 to-orange-100",
                  meal: "from-rose-100 to-pink-100",
                };
                const Icon = iconMap[entry.type as keyof typeof iconMap] || Sparkles;
                const background = backgroundMap[entry.type] || "from-slate-100 to-slate-200";

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${background} flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5 text-slate-700" />
                      </div>
                      <div>
                        <p className="text-slate-700 font-medium">{entry.title}</p>
                        <p className="text-slate-500 text-sm">{entry.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(entry.timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Weekly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-6 rounded-3xl border-white/20 bg-gradient-to-br from-violet-400 to-purple-400 text-white shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="mb-2 text-white">Weekly Overview</h3>
                <p className="text-white/80">Last 7 days performance</p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-2xl px-4 py-2 backdrop-blur-sm">
                <Award className="w-5 h-5" />
                <span>{weeklyStats.totalAchievements} achievements</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Apple className="w-5 h-5" />
                  <span className="text-white/80">Avg Calories</span>
                </div>
                <div className="text-2xl">{weeklyStats.avgCalories}</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="text-white/80">Avg Protein</span>
                </div>
                <div className="text-2xl">{weeklyStats.avgProtein}g</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-5 h-5" />
                  <span className="text-white/80">Avg Sleep</span>
                </div>
                <div className="text-2xl">{weeklyStats.avgSleep}h</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-white/80">Workouts</span>
                </div>
                <div className="text-2xl">{weeklyStats.totalWorkouts}</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5" />
                  <span className="text-white/80">Goals Hit</span>
                </div>
                <div className="text-2xl">{weeklyStats.goalsHit}/7</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-white/80">Streak</span>
                </div>
                <div className="text-2xl">7 days</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* How the App Helped */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="mb-4">Cum te-a ajutat Fitter</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {improvements.map((improvement, index) => {
              const Icon = improvement.icon;
              const isPositive = improvement.trend === "up" && !improvement.metric.includes("Stress");
              const isImprovement = improvement.trend === "down" && improvement.metric.includes("Stress");
              const showPositive = isPositive || isImprovement;

              return (
                <motion.div
                  key={improvement.metric}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card className="p-5 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${improvement.gradient} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4>{improvement.metric}</h4>
                          <Badge
                            className={`rounded-full border-0 ${
                              showPositive
                                ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700"
                                : "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700"
                            }`}
                          >
                            {showPositive ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {improvement.change}
                          </Badge>
                        </div>
                        <p className="text-slate-600">{improvement.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Wellness History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="mb-4">Wellness History</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wellnessHistory.map((day, index) => (
                <DayCard
                  key={day.date}
                  date={day.date}
                  wellness={day.wellness}
                  movement={day.movement}
                  nutrition={day.nutrition}
                  onViewDetails={handleViewDayDetails}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Daily History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="mb-4">Istoric Zilnic</h3>
          <div className="space-y-3">
            {historyData.map((day, index) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString("ro-RO", { weekday: "long" });
              const dateStr = date.toLocaleDateString("ro-RO", {
                day: "numeric",
                month: "long",
              });

              const calorieProgress = (day.calories.consumed / day.calories.target) * 100;
              const proteinProgress = (day.protein.consumed / day.protein.target) * 100;
              const waterProgress = (day.water.consumed / day.water.target) * 100;

              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="capitalize mb-1">{dayName}</h4>
                        <p className="text-slate-500 capitalize">{dateStr}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-4 py-2 rounded-2xl bg-gradient-to-r ${getMoodColor(
                            day.mood
                          )} text-white text-2xl`}
                        >
                          {getMoodEmoji(day.mood)}
                        </div>
                        <Badge
                          className={`rounded-full bg-gradient-to-r ${getSleepQualityColor(
                            day.sleep.quality
                          )} text-white border-0`}
                        >
                          <Moon className="w-3 h-3 mr-1" />
                          {day.sleep.hours}h
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-600">Calories</span>
                          <span className="text-slate-900">
                            {day.calories.consumed}/{day.calories.target}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full transition-all"
                            style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-600">Protein</span>
                          <span className="text-slate-900">
                            {day.protein.consumed}g/{day.protein.target}g
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all"
                            style={{ width: `${Math.min(proteinProgress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-600">Water</span>
                          <span className="text-slate-900">
                            {day.water.consumed}L/{day.water.target}L
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full transition-all"
                            style={{ width: `${Math.min(waterProgress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-slate-700 border-0">
                        <Activity className="w-3 h-3 mr-1" />
                        {day.workouts} workout{day.workouts !== 1 ? "s" : ""}
                      </Badge>
                      <Badge className="rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-slate-700 border-0">
                        {day.steps.toLocaleString()} steps
                      </Badge>
                    </div>

                    {/* Achievements */}
                    {day.achievements.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span className="text-slate-700">Achievements</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {day.achievements.map((achievement, i) => (
                            <Badge
                              key={i}
                              className="rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-0"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-6"
        >
          <Card className="p-6 rounded-3xl border-white/20 bg-gradient-to-br from-sky-50 to-cyan-50 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="mb-2">AI Insight</h4>
                <p className="text-slate-600 mb-3">
                  Based on your data, you're making excellent progress! Your consistency in tracking meals
                  has led to a 15% improvement in sleep quality. Keep maintaining your protein intake and
                  aim for 10k steps daily for optimal results.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Sleep +15%
                  </Badge>
                  <Badge className="rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-0">
                    <Target className="w-3 h-3 mr-1" />
                    7-day streak
                  </Badge>
                  <Badge className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {weeklyStats.totalAchievements} achievements
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
