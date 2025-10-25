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
  BedDouble,
  Utensils,
  Smile,
  Frown,
  Meh,
  Angry,
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
  const [activePlan, setActivePlan] = useState<any>(null);
  const {
    logs,
    nutritionLogs,
    hydrationToday,
    workoutCaloriesToday,
    sleepHoursToday,
    mealCountToday,
  } = useActivityData();

  // Fetch active plan
  useEffect(() => {
    const fetchActivePlan = async () => {
      try {
        const response = await api.getActivePlan();
        if (response.success && response.data) {
          setActivePlan(response.data);
        } else {
          setActivePlan(null);
        }
      } catch (error) {
        console.error("Failed to fetch active plan:", error);
        setActivePlan(null);
      }
    };
    
    fetchActivePlan();
    
    // Refresh plan every 5 seconds to catch new plans
    const interval = setInterval(fetchActivePlan, 5000);
    
    // Listen for plan changes from other pages
    const handlePlanChange = (event: CustomEvent) => {
      setActivePlan(event.detail.plan);
    };
    window.addEventListener('planChanged', handlePlanChange as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('planChanged', handlePlanChange as EventListener);
    };
  }, []);

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

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "calm":
        return <Smile className="w-5 h-5 text-[#04101B]" />;
      case "stressed":
        return <Frown className="w-5 h-5 text-[#04101B]" />;
      case "focused":
        return <Target className="w-5 h-5 text-[#04101B]" />;
      case "energized":
        return <Zap className="w-5 h-5 text-[#04101B]" />;
      default:
        return <Meh className="w-5 h-5 text-[#04101B]" />;
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
    <div className="min-h-screen bg-gradient-modern relative pb-24">
      <div className="container mx-auto px-6 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <FitterLogo size={36} />
              <div className="absolute -inset-1 bg-gradient-to-r from-[#6BF178] to-[#E2F163] rounded-full opacity-20 blur-md"></div>
            </div>
          </div>
          <button 
            onClick={onProfileClick} 
            className="focus:outline-none hover:scale-110 transition-transform duration-300 relative group"
          >
            <UserAvatar size={40} userName="Alex Thompson" />
            <div className="absolute -inset-1 bg-gradient-to-r from-[#6BF178] to-[#E2F163] rounded-full opacity-0 group-hover:opacity-30 blur-md transition-opacity"></div>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setViewMode("week")}
            className={`px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-300 ${
              viewMode === "week" 
                ? "bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] shadow-[0_0_20px_rgba(107,241,120,0.5)]"
                : "bg-[#0a1f33]/50 border-2 border-[#6BF178]/30 text-[#DFF2D4] hover:bg-[#6BF178]/20 hover:border-[#6BF178]"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-300 ${
              viewMode === "month"
                ? "bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] shadow-[0_0_20px_rgba(107,241,120,0.5)]"
                : "bg-[#0a1f33]/50 border-2 border-[#6BF178]/30 text-[#DFF2D4] hover:bg-[#6BF178]/20 hover:border-[#6BF178]"
            }`}
          >
            Month
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="modern-card glass-card-intense p-6 rounded-3xl hover-lift overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6BF178] to-[#E2F163] flex items-center justify-center glow-effect-green pulse-modern">
                  <Sparkles className="w-6 h-6 text-[#04101B]" />
                </div>
                <div>
                  <h3 className="text-gradient-modern text-glow text-lg font-bold">Assistant Timeline</h3>
                  <p className="text-[#DFF2D4]/70 text-sm">Latest AI-driven entries</p>
                </div>
              </div>
              <Badge className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] border-0 font-semibold shadow-[0_0_15px_rgba(107,241,120,0.4)]">
                {activityTimeline.length ? `${activityTimeline.length} updates` : "No data yet"}
              </Badge>
            </div>

            <div className="space-y-4">
              {activityTimeline.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#6BF178]/30 p-6 text-center text-[#DFF2D4]/70 bg-[#0a1f33]/30">
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
                  hydration: "from-[#6BF178] to-[#DFF2D4]",
                  sleep: "from-[#A855F7] to-[#6BF178]",
                  workout: "from-[#E2F163] to-[#6BF178]",
                  meal: "from-[#FF006E] to-[#E2F163]",
                };
                const Icon = iconMap[entry.type as keyof typeof iconMap] || Sparkles;
                const background = backgroundMap[entry.type] || "from-[#6BF178] to-[#E2F163]";

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-[#0a1f33]/50 backdrop-blur-sm border border-[#6BF178]/20 p-4 hover:bg-[#0a1f33]/70 hover:border-[#6BF178]/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${background} flex items-center justify-center glow-effect-green`}
                      >
                        <Icon className="w-5 h-5 text-[#04101B]" />
                      </div>
                      <div>
                        <p className="text-[#DFF2D4] font-medium">{entry.title}</p>
                        <p className="text-[#DFF2D4]/70 text-sm">{entry.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#DFF2D4]/50">
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
          <Card className="modern-card glass-card-intense p-6 rounded-3xl hover-lift overflow-hidden">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="mb-2 text-gradient-modern text-glow text-lg font-bold">Weekly Overview</h3>
                <p className="text-[#DFF2D4]/80 text-sm">Last 7 days performance</p>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#6BF178]/20 to-[#E2F163]/20 rounded-2xl px-4 py-2 backdrop-blur-sm border border-[#6BF178]/30">
                <Award className="w-5 h-5 text-[#6BF178]" />
                <span className="text-[#DFF2D4] font-semibold">{weeklyStats.totalAchievements} achievements</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#6BF178]/20 to-[#E2F163]/10 backdrop-blur-sm rounded-2xl p-4 border border-[#6BF178]/30">
                <div className="flex items-center gap-2 mb-2">
                  <Apple className="w-5 h-5 text-[#6BF178]" />
                  <span className="text-[#DFF2D4]">Avg Calories</span>
                </div>
                <div className="text-2xl text-gradient-modern font-bold">{weeklyStats.avgCalories}</div>
              </div>

              <div className="bg-gradient-to-br from-[#E2F163]/20 to-[#6BF178]/10 backdrop-blur-sm rounded-2xl p-4 border border-[#E2F163]/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-[#E2F163]" />
                  <span className="text-[#DFF2D4]">Avg Protein</span>
                </div>
                <div className="text-2xl text-gradient-modern font-bold">{weeklyStats.avgProtein}g</div>
              </div>

              <div className="bg-gradient-to-br from-[#A855F7]/20 to-[#6BF178]/10 backdrop-blur-sm rounded-2xl p-4 border border-[#A855F7]/30">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-5 h-5 text-[#A855F7]" />
                  <span className="text-[#DFF2D4]">Avg Sleep</span>
                </div>
                <div className="text-2xl text-gradient-modern font-bold">{weeklyStats.avgSleep}h</div>
              </div>

              <div className="bg-gradient-to-br from-[#6BF178]/20 to-[#DFF2D4]/10 backdrop-blur-sm rounded-2xl p-4 border border-[#6BF178]/30">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-[#6BF178]" />
                  <span className="text-[#DFF2D4]">Workouts</span>
                </div>
                <div className="text-2xl text-gradient-modern font-bold">{weeklyStats.totalWorkouts}</div>
              </div>

              <div className="bg-gradient-to-br from-[#E2F163]/20 to-[#A855F7]/10 backdrop-blur-sm rounded-2xl p-4 border border-[#E2F163]/30">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-[#E2F163]" />
                  <span className="text-[#DFF2D4]">Goals Hit</span>
                </div>
                <div className="text-2xl text-gradient-modern font-bold">{weeklyStats.goalsHit}/7</div>
              </div>

              <div className="bg-gradient-to-br from-[#6BF178]/20 to-[#E2F163]/10 backdrop-blur-sm rounded-2xl p-4 border border-[#6BF178]/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[#6BF178]" />
                  <span className="text-[#DFF2D4]">Streak</span>
                </div>
                <div className="text-2xl text-gradient-modern font-bold">7 days</div>
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
          <h3 className="mb-4 text-gradient-modern text-glow text-lg font-bold">Cum te-a ajutat Fitter</h3>
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
                  <Card className="modern-card glass-card-intense p-5 rounded-3xl hover-lift overflow-hidden">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${improvement.gradient} flex items-center justify-center flex-shrink-0 glow-effect-green pulse-modern`}
                      >
                        <Icon className="w-7 h-7 text-[#04101B]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[#DFF2D4] font-semibold">{improvement.metric}</h4>
                          <Badge
                            className={`rounded-full border-0 ${
                              showPositive
                                ? "bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] shadow-[0_0_15px_rgba(107,241,120,0.4)]"
                                : "bg-gradient-to-r from-[#0a1f33] to-[#0a1f33]/80 text-[#DFF2D4] border border-[#6BF178]/30"
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
                        <p className="text-[#DFF2D4]/70">{improvement.description}</p>
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
          <h3 className="mb-4 text-gradient-modern text-glow text-lg font-bold">Daily History</h3>
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
                  <Card className="modern-card glass-card-intense p-6 rounded-3xl hover-lift overflow-hidden">
                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="capitalize mb-1 text-[#DFF2D4] font-semibold">{dayName}</h4>
                        <p className="text-[#DFF2D4]/70 capitalize text-sm">{dateStr}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-4 py-2 rounded-2xl bg-gradient-to-r ${getMoodColor(
                            day.mood
                          )} text-[#04101B] shadow-[0_0_15px_rgba(107,241,120,0.3)] flex items-center justify-center`}
                        >
                          {getMoodIcon(day.mood)}
                        </div>
                        <Badge
                          className={`rounded-full bg-gradient-to-r ${getSleepQualityColor(
                            day.sleep.quality
                          )} text-[#04101B] border-0 shadow-[0_0_15px_rgba(107,241,120,0.3)]`}
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
                          <span className="text-[#DFF2D4]">Calories</span>
                          <span className="text-[#DFF2D4] font-semibold">
                            {day.calories.consumed}/{day.calories.target}
                          </span>
                        </div>
                        <div className="relative h-4 bg-[#DFF2D4]/20 rounded-full border border-[#6BF178]/30">
                          <div
                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(calorieProgress, 100)}%`,
                              background: 'linear-gradient(90deg, #FF006E, #E2F163)',
                              boxShadow: '0 0 15px rgba(255, 0, 110, 0.6)'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[#DFF2D4]">Protein</span>
                          <span className="text-[#DFF2D4] font-semibold">
                            {day.protein.consumed}g/{day.protein.target}g
                          </span>
                        </div>
                        <div className="relative h-4 bg-[#DFF2D4]/20 rounded-full border border-[#E2F163]/30">
                          <div
                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(proteinProgress, 100)}%`,
                              background: 'linear-gradient(90deg, #E2F163, #6BF178)',
                              boxShadow: '0 0 15px rgba(226, 241, 99, 0.6)'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[#DFF2D4]">Water</span>
                          <span className="text-[#DFF2D4] font-semibold">
                            {day.water.consumed}L/{day.water.target}L
                          </span>
                        </div>
                        <div className="relative h-4 bg-[#DFF2D4]/20 rounded-full border border-[#6BF178]/30">
                          <div
                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(waterProgress, 100)}%`,
                              background: 'linear-gradient(90deg, #6BF178, #DFF2D4)',
                              boxShadow: '0 0 15px rgba(107, 241, 120, 0.6)'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] border-0 font-semibold shadow-[0_0_15px_rgba(107,241,120,0.4)]">
                        <Activity className="w-3 h-3 mr-1" />
                        {day.workouts} workout{day.workouts !== 1 ? "s" : ""}
                      </Badge>
                      <Badge className="rounded-full bg-gradient-to-r from-[#A855F7] to-[#6BF178] text-[#DFF2D4] border-0 font-semibold shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        {day.steps.toLocaleString()} steps
                      </Badge>
                    </div>

                    {/* Achievements */}
                    {day.achievements.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-[#E2F163]" />
                          <span className="text-[#DFF2D4] font-semibold">Achievements</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {day.achievements.map((achievement, i) => (
                            <Badge
                              key={i}
                              className="rounded-full bg-gradient-to-r from-[#E2F163] to-[#6BF178] text-[#04101B] border-0 font-semibold shadow-[0_0_15px_rgba(226,241,99,0.4)]"
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
          <Card className="modern-card glass-card-intense p-6 rounded-3xl hover-lift overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] flex items-center justify-center flex-shrink-0 glow-effect-green pulse-modern">
                <Brain className="w-6 h-6 text-[#04101B]" />
              </div>
              <div>
                <h4 className="mb-2 text-gradient-modern text-glow font-bold">AI Insight</h4>
                <p className="text-[#DFF2D4]/80 mb-3">
                  Based on your data, you're making excellent progress! Your consistency in tracking meals
                  has led to a 15% improvement in sleep quality. Keep maintaining your protein intake and
                  aim for 10k steps daily for optimal results.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] border-0 font-semibold shadow-[0_0_15px_rgba(107,241,120,0.4)]">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Sleep +15%
                  </Badge>
                  <Badge className="rounded-full bg-gradient-to-r from-[#A855F7] to-[#6BF178] text-[#DFF2D4] border-0 font-semibold shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    <Target className="w-3 h-3 mr-1" />
                    7-day streak
                  </Badge>
                  <Badge className="rounded-full bg-gradient-to-r from-[#E2F163] to-[#6BF178] text-[#04101B] border-0 font-semibold shadow-[0_0_15px_rgba(226,241,99,0.4)]">
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
