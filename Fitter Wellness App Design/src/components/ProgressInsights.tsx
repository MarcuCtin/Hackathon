import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Moon, Droplet, Zap, Smile, Activity } from "lucide-react";

interface MetricData {
  name: string;
  value: number;
  target: number;
  color: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "stable";
  trendValue: number;
}

export function ProgressInsights() {
  const [activeTab, setActiveTab] = useState("overview");

  // Weekly data
  const weeklyData = [
    { day: "Mon", sleep: 7.5, hydration: 2.8, energy: 75, mood: 7 },
    { day: "Tue", sleep: 8.0, hydration: 3.2, energy: 82, mood: 8 },
    { day: "Wed", sleep: 6.5, hydration: 2.4, energy: 70, mood: 6 },
    { day: "Thu", sleep: 8.5, hydration: 3.5, energy: 85, mood: 9 },
    { day: "Fri", sleep: 7.0, hydration: 2.9, energy: 78, mood: 7 },
    { day: "Sat", sleep: 9.0, hydration: 3.8, energy: 88, mood: 9 },
    { day: "Sun", sleep: 8.0, hydration: 3.1, energy: 80, mood: 8 },
  ];

  // Metrics overview
  const metrics: MetricData[] = [
    {
      name: "Sleep",
      value: 7.8,
      target: 8.0,
      color: "#6366f1",
      icon: <Moon className="w-5 h-5" />,
      trend: "up",
      trendValue: 5,
    },
    {
      name: "Hydration",
      value: 3.1,
      target: 3.5,
      color: "#3b82f6",
      icon: <Droplet className="w-5 h-5" />,
      trend: "up",
      trendValue: 12,
    },
    {
      name: "Energy",
      value: 80,
      target: 85,
      color: "#f59e0b",
      icon: <Zap className="w-5 h-5" />,
      trend: "up",
      trendValue: 8,
    },
    {
      name: "Mood",
      value: 7.7,
      target: 8.5,
      color: "#10b981",
      icon: <Smile className="w-5 h-5" />,
      trend: "stable",
      trendValue: 0,
    },
  ];

  // Donut chart data
  const DonutProgress = ({ value, target, color, size = 120 }: any) => {
    const percentage = Math.min((value / target) * 100, 100);
    const data = [
      { name: "completed", value: percentage },
      { name: "remaining", value: 100 - percentage },
    ];

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <PieChart width={size} height={size}>
          <Pie
            data={data}
            cx={size / 2}
            cy={size / 2}
            innerRadius={size * 0.35}
            outerRadius={size * 0.45}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
        <div
          className="absolute inset-0 flex items-center justify-center flex-col"
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="text-2xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {Math.round(percentage)}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3>Progress & Insights</h3>
          <p className="text-slate-500">Your wellness analytics</p>
        </div>
        <Badge className="rounded-full bg-gradient-to-r from-sky-100 to-emerald-100 text-slate-700 border-0">
          <Activity className="w-3 h-3 mr-1" />
          Last 7 days
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 rounded-2xl bg-slate-100/80 p-1">
          <TabsTrigger value="overview" className="rounded-xl">
            Overview
          </TabsTrigger>
          <TabsTrigger value="sleep" className="rounded-xl">
            Sleep
          </TabsTrigger>
          <TabsTrigger value="energy" className="rounded-xl">
            Energy
          </TabsTrigger>
          <TabsTrigger value="mood" className="rounded-xl">
            Mood
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Donut Progress Rings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <DonutProgress
                      value={metric.value}
                      target={metric.target}
                      color={metric.color}
                      size={100}
                    />
                    <div className="mt-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${metric.color}20` }}
                        >
                          {metric.icon}
                        </div>
                      </div>
                      <p className="text-slate-700">{metric.name}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {metric.trend === "up" && (
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                        )}
                        {metric.trend === "down" && (
                          <TrendingDown className="w-3 h-3 text-rose-500" />
                        )}
                        <span
                          className={`text-xs ${
                            metric.trend === "up"
                              ? "text-emerald-600"
                              : metric.trend === "down"
                              ? "text-rose-600"
                              : "text-slate-500"
                          }`}
                        >
                          {metric.trend === "stable" ? "Stable" : `${metric.trendValue}%`}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Weekly trend */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-emerald-50 border border-sky-200/50">
                <p className="text-slate-700 mb-2">Weekly Summary</p>
                <p className="text-slate-600">
                  Your overall wellness score improved by <span className="text-emerald-600">12%</span> this
                  week. Great progress! 🎉
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Sleep Tab */}
        <TabsContent value="sleep" className="mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key="sleep"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50">
                    <p className="text-slate-600 mb-1">Weekly Average</p>
                    <div className="text-3xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      7.8h
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50">
                    <p className="text-slate-600 mb-1">Best Night</p>
                    <div className="text-3xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      9.0h
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sleep"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSleep)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/50">
                <p className="text-slate-700 mb-2">💡 Sleep Insight</p>
                <p className="text-slate-600">
                  You slept 5% better this week. Try maintaining your Saturday sleep routine for optimal
                  results.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Energy Tab */}
        <TabsContent value="energy" className="mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key="energy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50">
                    <p className="text-slate-600 mb-1">Average Energy</p>
                    <div className="text-3xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      80%
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50">
                    <p className="text-slate-600 mb-1">Peak Day</p>
                    <div className="text-3xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      88%
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ fill: "#f59e0b", strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50">
                <p className="text-slate-700 mb-2">⚡ Energy Insight</p>
                <p className="text-slate-600">
                  Your energy peaks on weekends. Consider adjusting your weekday routine to match this pattern.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Mood Tab */}
        <TabsContent value="mood" className="mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                    <p className="text-slate-600 mb-1">Average Mood</p>
                    <div className="text-3xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      7.7/10
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50">
                    <p className="text-slate-600 mb-1">Best Day</p>
                    <div className="text-3xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      9/10
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorMood)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50">
                <p className="text-slate-700 mb-2">😊 Mood Insight</p>
                <p className="text-slate-600">
                  Your mood correlates strongly with sleep quality. Prioritize rest for better emotional
                  wellbeing.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
