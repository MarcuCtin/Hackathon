import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { FitterLogo } from "./FitterLogo";
import { DailyRecommendations } from "./DailyRecommendations";
import { ProgressInsights } from "./ProgressInsights";
import { api, type DashboardData } from "../lib/api";
import { useActivityData } from "../context/ActivityContext";
import {
  Sun,
  Moon,
  Zap,
  TrendingUp,
  CheckCircle2,
  Circle,
  Apple,
  Droplet,
  Activity,
  Brain,
  MessageCircle,
  Send,
  Calendar,
  Clock,
  Target,
  Sparkles,
  BedDouble,
  Utensils,
  Dumbbell,
  Heart,
  User,
} from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  time?: string;
}

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface DashboardProps {
  onProfileClick?: () => void;
}

export function Dashboard({ onProfileClick }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState("");
  
  // Mock tasks for daily routine (can be replaced with real data later)
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Morning meditation", completed: true, time: "7:00 AM" },
    { id: 2, title: "Drink water (500ml)", completed: true, time: "7:30 AM" },
    { id: 3, title: "Healthy breakfast", completed: true, time: "8:00 AM" },
    { id: 4, title: "Take supplements", completed: false, time: "8:30 AM" },
    { id: 5, title: "Gym workout", completed: false, time: "6:00 PM" },
    { id: 6, title: "Evening walk", completed: false, time: "7:30 PM" },
  ]);
  
  const {
    logs,
    nutritionLogs,
    hydrationToday,
    workoutCaloriesToday,
    sleepHoursToday,
    mealCountToday,
  } = useActivityData();

  // Fetch dashboard data from database
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data } = await api.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Use database data or fallback to context data
  const dailyStats = dashboardData?.daily || {
    hydration: hydrationToday,
    workoutCalories: workoutCaloriesToday,
    sleepHours: sleepHoursToday || 0,
    mealCount: mealCountToday,
    totalCalories: 0,
    totalProtein: 0,
  };

  const recentChatMessages = dashboardData?.recent.chatMessages || [];
  const recentLogs = dashboardData?.recent.logs || [];
  const recentNutrition = dashboardData?.recent.nutrition || [];

  const activityEntries = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const logEntries = (logs || [])
      .filter((log) => new Date(log.date).getTime() >= start.getTime())
      .map((log) => {
        const baseLabel: Record<string, string> = {
          hydration: "Hydration",
          sleep: "Sleep",
          workout: "Workout",
        };

        const details = (() => {
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

        return {
          id: log._id,
          type: log.type,
          label: `${baseLabel[log.type] || "Log"} saved`,
          details,
          timestamp: log.date,
        };
      });

    const mealEntries = (nutritionLogs || [])
      .filter((meal) => new Date(meal.date).getTime() >= start.getTime())
      .map((meal) => {
        const totalCalories = meal.total?.calories ?? 0;
        const primaryItem = meal.items?.[0]?.name || "Meal";

        return {
          id: meal._id,
          type: "meal",
          label: `Meal logged • ${meal.mealType}`,
          details: `${primaryItem}${totalCalories ? ` · ${totalCalories} kcal` : ""}`,
          timestamp: meal.date,
        };
      });

    return [...logEntries, ...mealEntries]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);
  }, [logs, nutritionLogs]);

  // Energy data for the week
  const energyData = [
    { day: "Mon", energy: 75, sleep: 7.5 },
    { day: "Tue", energy: 82, sleep: 8.0 },
    { day: "Wed", energy: 70, sleep: 6.5 },
    { day: "Thu", energy: 85, sleep: 8.5 },
    { day: "Fri", energy: 78, sleep: 7.0 },
    { day: "Sat", energy: 88, sleep: 9.0 },
    { day: "Sun", energy: 80, sleep: 8.0 },
  ];

  // Nutrition tracking
  const nutritionData = [
    { name: "Protein", value: 85, target: 100, color: "#7dd3fc" },
    { name: "Carbs", value: 120, target: 150, color: "#6ee7b7" },
    { name: "Fats", value: 60, target: 70, color: "#fbbf24" },
    { name: "Water", value: 2.5, target: 3, color: "#60a5fa", unit: "L" },
  ];

  // Weekly progress
  const weeklyProgress = [
    { day: "M", value: 75 },
    { day: "T", value: 82 },
    { day: "W", value: 70 },
    { day: "T", value: 85 },
    { day: "F", value: 78 },
    { day: "S", value: 88 },
    { day: "S", value: 80 },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    // TODO: Implement real chat functionality with AI
    // For now, just clear the input
    setChatInput("");
    
    // Show a placeholder message
    console.log("Chat message:", chatInput);
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionPercentage = (completedTasks / tasks.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <FitterLogo size={36} />
            <div className="flex items-center gap-4">
              <Badge className="rounded-full bg-gradient-to-r from-sky-100 to-emerald-100 text-slate-700 border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium
              </Badge>
              <Badge className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-0">
                🔥 {dailyStats.workoutCalories} kcal
              </Badge>
              <Badge className="rounded-full bg-gradient-to-r from-sky-100 to-blue-100 text-blue-700 border-0">
                💧 {dailyStats.hydration}
              </Badge>
              <Badge className="rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-0">
                🛌 {dailyStats.sleepHours || "-"} h
              </Badge>
              <Badge className="rounded-full bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border-0">
                🥗 {dailyStats.mealCount}
              </Badge>
              <button onClick={onProfileClick} className="focus:outline-none">
                <UserAvatar size={40} userName="Alex Thompson" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2">
            {getGreeting()}, Marcu 👋
          </h1>
          <p className="text-slate-600">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Routine */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <h3>Daily Routine</h3>
                      <p className="text-slate-500">
                        {completedTasks} of {tasks.length} completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                      {Math.round(completionPercentage)}%
                    </div>
                  </div>
                </div>

                <Progress value={completionPercentage} className="mb-6 h-2" />

                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      onClick={() => toggleTask(task.id)}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 hover:bg-white/80 cursor-pointer transition-all group"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
                      )}
                      <span
                        className={`flex-1 ${
                          task.completed ? "text-slate-400 line-through" : "text-slate-700"
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.time && (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {task.time}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3>AI Synced Actions</h3>
                      <p className="text-slate-500">Latest from assistant</p>
                    </div>
                  </div>
                  <Badge className="rounded-full bg-slate-100 text-slate-700 border-0">
                    {recentLogs.length > 0 ? `${recentLogs.length} recent` : "No entries yet"}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                    </div>
                  ) : recentLogs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
                      <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No recent activities</p>
                      <p className="text-sm">Start logging activities to see them here!</p>
                    </div>
                  ) : (
                    recentLogs.map((log) => {
                      const iconMap = {
                        hydration: Droplet,
                        sleep: Moon,
                        workout: Dumbbell,
                        meal: Utensils,
                      } as const;
                      const bgMap: Record<string, string> = {
                        hydration: "from-sky-100 to-blue-100",
                        sleep: "from-indigo-100 to-purple-100",
                        workout: "from-amber-100 to-orange-100",
                        meal: "from-rose-100 to-pink-100",
                      };
                      const Icon = iconMap[log.type as keyof typeof iconMap] || Sparkles;
                      const background = bgMap[log.type] || "from-slate-100 to-slate-200";

                      return (
                        <div
                          key={log._id}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-br ${background}`}
                            >
                              <Icon className="w-5 h-5 text-slate-700" />
                            </div>
                            <div>
                              <p className="text-slate-700 font-medium">
                                {log.type === 'hydration' ? 'Water logged' :
                                 log.type === 'sleep' ? 'Sleep logged' :
                                 log.type === 'workout' ? 'Workout logged' :
                                 log.type === 'meal' ? 'Meal logged' : 'Activity logged'}
                              </p>
                              <p className="text-slate-500 text-sm">
                                {log.value} {log.unit || ''} {log.note ? `· ${log.note}` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(log.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Energy & Sleep */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3>Energy & Sleep</h3>
                    <p className="text-slate-500">Last 7 days</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="w-5 h-5 text-amber-600" />
                      <span className="text-slate-600">Energy Level</span>
                    </div>
                    <div className="text-3xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      80%
                    </div>
                    <p className="text-slate-500">+5% from last week</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50">
                    <div className="flex items-center gap-2 mb-2">
                      <BedDouble className="w-5 h-5 text-indigo-600" />
                      <span className="text-slate-600">Sleep Quality</span>
                    </div>
                    <div className="text-3xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      8.0h
                    </div>
                    <p className="text-slate-500">Average this week</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={energyData}>
                    <defs>
                      <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="energy"
                      stroke="#7dd3fc"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEnergy)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Nutrition & Supplements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3>Nutrition & Supplements</h3>
                    <p className="text-slate-500">Today's intake</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {nutritionData.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="p-4 rounded-2xl bg-white/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-600">{item.name}</span>
                        <span className="text-slate-900">
                          {item.value}
                          {item.unit || "g"} / {item.target}
                          {item.unit || "g"}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.value / item.target) * 100}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      💊
                    </div>
                    <div>
                      <p className="text-slate-700 mb-1">Don't forget your supplements!</p>
                      <p className="text-slate-500">Vitamin D, Omega-3, Magnesium</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Daily Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
                <DailyRecommendations />
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Old Progress Card - Hidden, replaced by full-width version below */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="hidden"
            >
              <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3>Progress</h3>
                    <p className="text-slate-500">This week</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7dd3fc" />
                        <stop offset="100%" stopColor="#6ee7b7" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-6 space-y-3">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100/50 border border-sky-200/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-sky-600" />
                      <span className="text-slate-700">Weekly Goal</span>
                    </div>
                    <p className="text-slate-600">88% Complete</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4 text-emerald-600" />
                      <span className="text-slate-700">Wellness Score</span>
                    </div>
                    <p className="text-slate-600">Excellent (95/100)</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* AI Coach Chatbot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h3>AI Coach</h3>
                    <p className="text-slate-500">Your wellness assistant</p>
                  </div>
                </div>

                <ScrollArea className="h-[300px] mb-4 pr-4">
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
                      </div>
                    ) : recentChatMessages.length > 0 ? (
                      recentChatMessages.map((message) => (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-2xl ${
                              message.role === "user"
                                ? "bg-gradient-to-br from-sky-400 to-emerald-400 text-white"
                                : "bg-white/80 text-slate-700"
                            }`}
                          >
                            {message.content}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 py-8">
                        <Brain className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No chat messages yet</p>
                        <p className="text-sm">Start a conversation with your AI coach!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask your AI coach..."
                    className="rounded-2xl border-slate-200 bg-white/50"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
                <h3 className="mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 rounded-2xl border-slate-200 bg-white/50 hover:bg-white/80"
                  >
                    <Activity className="w-5 h-5 text-sky-600" />
                    <span>Log Activity</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 rounded-2xl border-slate-200 bg-white/50 hover:bg-white/80"
                  >
                    <Apple className="w-5 h-5 text-emerald-600" />
                    <span>Log Meal</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 rounded-2xl border-slate-200 bg-white/50 hover:bg-white/80"
                  >
                    <Droplet className="w-5 h-5 text-blue-600" />
                    <span>Add Water</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 rounded-2xl border-slate-200 bg-white/50 hover:bg-white/80"
                  >
                    <Moon className="w-5 h-5 text-indigo-600" />
                    <span>Sleep Log</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Full Width Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <ProgressInsights />
        </motion.div>
      </div>
    </div>
  );
}
