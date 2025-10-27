import { useState, useEffect } from "react";
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
import { api } from "../lib/api";
import { toast } from "sonner";

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
  const [weeklyData, setWeeklyData] = useState([
    { day: "Mon", sleep: 7.5, hydration: 2.8, energy: 75, mood: 7 },
    { day: "Tue", sleep: 8.0, hydration: 3.2, energy: 82, mood: 8 },
    { day: "Wed", sleep: 6.5, hydration: 2.4, energy: 70, mood: 6 },
    { day: "Thu", sleep: 8.5, hydration: 3.5, energy: 85, mood: 9 },
    { day: "Fri", sleep: 7.0, hydration: 2.9, energy: 78, mood: 7 },
    { day: "Sat", sleep: 9.0, hydration: 3.8, energy: 88, mood: 9 },
    { day: "Sun", sleep: 8.0, hydration: 3.1, energy: 80, mood: 8 },
  ]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([
    {
      name: "Sleep",
      value: 7.8,
      target: 8.0,
      color: "#6366f1",
      icon: <Moon className="w-5 h-5" />,
      trend: "up" as const,
      trendValue: 5,
    },
    {
      name: "Hydration",
      value: 3.1,
      target: 3.5,
      color: "#3b82f6",
      icon: <Droplet className="w-5 h-5" />,
      trend: "up" as const,
      trendValue: 12,
    },
    {
      name: "Energy",
      value: 80,
      target: 85,
      color: "#f59e0b",
      icon: <Zap className="w-5 h-5" />,
      trend: "up" as const,
      trendValue: 8,
    },
    {
      name: "Mood",
      value: 7.7,
      target: 8.5,
      color: "#10b981",
      icon: <Smile className="w-5 h-5" />,
      trend: "stable" as const,
      trendValue: 0,
    },
  ]);

  // Fetch insights from backend
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard data which includes weekly energy data
        const dashboardResponse = await api.getDashboardData();
        
        if (dashboardResponse.success && dashboardResponse.data) {
          // Get weekly energy data from dashboard
          if (dashboardResponse.data.analytics?.weeklyEnergy) {
            const energyData = dashboardResponse.data.analytics.weeklyEnergy;
            
            // Transform to weekly chart format
            const transformedData = energyData.map((item: any) => ({
              day: item.day || "Mon",
              sleep: item.sleep || 7.5,
              hydration: 2.8, // Approximate
              energy: item.energy || 75,
              mood: item.mood || 7,
            }));
            
            setWeeklyData(transformedData);
            
            // Calculate averages
            const avgSleep = transformedData.reduce((sum, d) => sum + d.sleep, 0) / transformedData.length;
            const avgEnergy = transformedData.reduce((sum, d) => sum + d.energy, 0) / transformedData.length;
            const bestSleep = Math.max(...transformedData.map(d => d.sleep));
            const bestEnergy = Math.max(...transformedData.map(d => d.energy));
            
            // Get today's sleep data
            const today = new Date();
            const todayDayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];
            const todayData = transformedData.find(d => d.day === todayDayName);
            const todaySleep = todayData?.sleep || 0;
            
            // Update metrics with real data
            setMetrics([
              {
                name: "Sleep",
                value: todaySleep, // Show today's sleep hours instead of average
                target: 8.0,
                color: "#6366f1",
                icon: <Moon className="w-5 h-5" />,
                trend: todaySleep >= 7.5 ? "up" : "down",
                trendValue: Math.abs(((todaySleep - 7.5) / 7.5) * 100),
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
                value: avgEnergy,
                target: 85,
                color: "#f59e0b",
                icon: <Zap className="w-5 h-5" />,
                trend: avgEnergy > 75 ? "up" : "down",
                trendValue: Math.abs(((avgEnergy - 75) / 75) * 100),
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
            ]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch insights:", error);
        toast.error("Failed to load insights");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);


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
            <Cell fill="rgba(107, 241, 120, 0.1)" />
          </Pie>
        </PieChart>
        <div
          className="absolute inset-0 flex items-center justify-center flex-col"
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="text-xl text-[#DFF2D4] font-bold text-glow">
            {Math.round(percentage)}%
          </div>
          <div className="text-xs text-[#DFF2D4]/70">
            {value.toFixed(1)}h / {target.toFixed(1)}h
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="modern-card glass-card-intense p-6 rounded-3xl hover-lift overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6BF178] to-[#E2F163] flex items-center justify-center glow-effect-green pulse-modern">
            <TrendingUp className="w-6 h-6 text-[#04101B]" />
          </div>
          <div>
            <h3 className="text-gradient-modern text-glow text-lg font-bold">Progress & Insights</h3>
            <p className="text-[#DFF2D4]/70 text-sm">Your wellness analytics</p>
          </div>
        </div>
        <Badge className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] border-0 font-semibold shadow-[0_0_15px_rgba(107,241,120,0.4)]">
          <Activity className="w-3 h-3 mr-1" />
          Last 7 days
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 rounded-2xl bg-gradient-to-r from-[#04101B]/95 via-[#0a1f33]/90 to-[#04101B]/95 backdrop-blur-md border-2 border-[#6BF178]/40 p-2 shadow-lg shadow-[#6BF178]/20">
          <TabsTrigger 
            value="overview" 
            className="relative overflow-hidden rounded-xl px-4 py-3 font-semibold transition-all duration-500 ease-out
              data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#6BF178] data-[state=active]:via-[#E2F163] data-[state=active]:to-[#6BF178] 
              data-[state=active]:text-[#04101B] data-[state=active]:shadow-lg data-[state=active]:shadow-[#6BF178]/60
              data-[state=active]:scale-105 data-[state=active]:border-2 data-[state=active]:border-[#E2F163]/80
              data-[state=active]:shadow-[0_0_20px_rgba(107,241,120,0.4)]
              text-[#DFF2D4] hover:text-[#6BF178] hover:bg-[#6BF178]/10 hover:scale-102
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#6BF178]/0 before:to-[#E2F163]/0
              before:transition-all before:duration-500 hover:before:from-[#6BF178]/20 hover:before:to-[#E2F163]/20"
          >
            <span className="relative z-10">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="sleep" 
            className="relative overflow-hidden rounded-xl px-4 py-3 font-semibold transition-all duration-500 ease-out
              data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#6BF178] data-[state=active]:via-[#E2F163] data-[state=active]:to-[#6BF178] 
              data-[state=active]:text-[#04101B] data-[state=active]:shadow-lg data-[state=active]:shadow-[#6BF178]/60
              data-[state=active]:scale-105 data-[state=active]:border-2 data-[state=active]:border-[#E2F163]/80
              data-[state=active]:shadow-[0_0_20px_rgba(107,241,120,0.4)]
              text-[#DFF2D4] hover:text-[#6BF178] hover:bg-[#6BF178]/10 hover:scale-102
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#6BF178]/0 before:to-[#E2F163]/0
              before:transition-all before:duration-500 hover:before:from-[#6BF178]/20 hover:before:to-[#E2F163]/20"
          >
            <span className="relative z-10">Sleep</span>
          </TabsTrigger>
          <TabsTrigger 
            value="energy" 
            className="relative overflow-hidden rounded-xl px-4 py-3 font-semibold transition-all duration-500 ease-out
              data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#6BF178] data-[state=active]:via-[#E2F163] data-[state=active]:to-[#6BF178] 
              data-[state=active]:text-[#04101B] data-[state=active]:shadow-lg data-[state=active]:shadow-[#6BF178]/60
              data-[state=active]:scale-105 data-[state=active]:border-2 data-[state=active]:border-[#E2F163]/80
              data-[state=active]:shadow-[0_0_20px_rgba(107,241,120,0.4)]
              text-[#DFF2D4] hover:text-[#6BF178] hover:bg-[#6BF178]/10 hover:scale-102
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#6BF178]/0 before:to-[#E2F163]/0
              before:transition-all before:duration-500 hover:before:from-[#6BF178]/20 hover:before:to-[#E2F163]/20"
          >
            <span className="relative z-10">Energy</span>
          </TabsTrigger>
          <TabsTrigger 
            value="mood" 
            className="relative overflow-hidden rounded-xl px-4 py-3 font-semibold transition-all duration-500 ease-out
              data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#6BF178] data-[state=active]:via-[#E2F163] data-[state=active]:to-[#6BF178] 
              data-[state=active]:text-[#04101B] data-[state=active]:shadow-lg data-[state=active]:shadow-[#6BF178]/60
              data-[state=active]:scale-105 data-[state=active]:border-2 data-[state=active]:border-[#E2F163]/80
              data-[state=active]:shadow-[0_0_20px_rgba(107,241,120,0.4)]
              text-[#DFF2D4] hover:text-[#6BF178] hover:bg-[#6BF178]/10 hover:scale-102
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#6BF178]/0 before:to-[#E2F163]/0
              before:transition-all before:duration-500 hover:before:from-[#6BF178]/20 hover:before:to-[#E2F163]/20"
          >
            <span className="relative z-10">Mood</span>
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
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6BF178]/20 to-[#E2F163]/20 flex items-center justify-center border border-[#6BF178]/30">
                          <div className="text-[#6BF178]">{metric.icon}</div>
                        </div>
                      </div>
                      <p className="text-[#DFF2D4] font-semibold">{metric.name}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {metric.trend === "up" && (
                          <TrendingUp className="w-3 h-3 text-[#6BF178]" />
                        )}
                        {metric.trend === "down" && (
                          <TrendingDown className="w-3 h-3 text-[#FF006E]" />
                        )}
                        <span
                          className={`text-xs font-semibold ${
                            metric.trend === "up"
                              ? "text-[#6BF178]"
                              : metric.trend === "down"
                              ? "text-[#FF006E]"
                              : "text-[#DFF2D4]/70"
                          }`}
                        >
                          {metric.trend === "stable" ? "Stable" : `${metric.trendValue.toFixed(1)}%`}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Weekly trend */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6BF178]/20 to-[#E2F163]/20 border border-[#6BF178]/30 backdrop-blur-sm modern-card">
                <p className="text-[#DFF2D4] mb-2 font-semibold">Weekly Summary</p>
                <p className="text-[#DFF2D4]/80">
                  Your overall wellness score improved by <span className="text-[#6BF178] font-bold">12%</span> this
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
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#A855F7]/20 to-[#6BF178]/20 border border-[#A855F7]/30 backdrop-blur-sm modern-card">
                    <p className="text-[#DFF2D4] mb-1 font-semibold">Weekly Average</p>
                    <div className="text-3xl text-gradient-modern font-bold">
                      {loading ? "..." : `${weeklyData.reduce((sum, d) => sum + d.sleep, 0) / weeklyData.length || 0}H`}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6BF178]/20 to-[#E2F163]/20 border border-[#6BF178]/30 backdrop-blur-sm modern-card">
                    <p className="text-[#DFF2D4] mb-1 font-semibold">Best Night</p>
                    <div className="text-3xl text-gradient-modern font-bold">
                      {loading ? "..." : `${Math.max(...weeklyData.map(d => d.sleep), 0)}H`}
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFF2D4" opacity={0.1} />
                    <XAxis dataKey="day" stroke="#DFF2D4" />
                    <YAxis stroke="#DFF2D4" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(4, 16, 27, 0.9)",
                        border: "1px solid #6BF178",
                        borderRadius: "12px",
                        boxShadow: "0 0 20px rgba(107, 241, 120, 0.3)",
                        color: "#DFF2D4"
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sleep"
                      stroke="#A855F7"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSleep)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#A855F7]/20 to-[#6BF178]/20 border border-[#A855F7]/30 backdrop-blur-sm modern-card">
                <p className="text-[#DFF2D4] mb-2 font-semibold">💡 Sleep Insight</p>
                <p className="text-[#DFF2D4]/80">
                  You slept <span className="text-[#6BF178] font-bold">5%</span> better this week. Try maintaining your Saturday sleep routine for optimal
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
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F7B801]/20 to-[#FF6B35]/20 border border-[#F7B801]/30 backdrop-blur-sm modern-card">
                    <p className="text-[#DFF2D4] mb-1 font-semibold">Average Energy</p>
                    <div className="text-3xl text-gradient-modern font-bold">
                      {loading ? "..." : `${Math.round(weeklyData.reduce((sum, d) => sum + d.energy, 0) / weeklyData.length || 0)}%`}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FF6B35]/20 to-[#FF006E]/20 border border-[#FF6B35]/30 backdrop-blur-sm modern-card">
                    <p className="text-[#DFF2D4] mb-1 font-semibold">Peak Day</p>
                    <div className="text-3xl text-gradient-modern font-bold">
                      {loading ? "..." : `${Math.round(Math.max(...weeklyData.map(d => d.energy), 0))}%`}
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F7B801" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F7B801" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFF2D4" opacity={0.1} />
                    <XAxis dataKey="day" stroke="#DFF2D4" />
                    <YAxis stroke="#DFF2D4" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(4, 16, 27, 0.9)",
                        border: "1px solid #F7B801",
                        borderRadius: "12px",
                        boxShadow: "0 0 20px rgba(247, 184, 1, 0.3)",
                        color: "#DFF2D4"
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="#F7B801"
                      strokeWidth={3}
                      dot={{ fill: "#F7B801", strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F7B801]/20 to-[#FF6B35]/20 border border-[#F7B801]/30 backdrop-blur-sm modern-card">
                <p className="text-[#DFF2D4] mb-2 font-semibold">⚡ Energy Insight</p>
                <p className="text-[#DFF2D4]/80">
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
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6BF178]/20 to-[#00F5FF]/20 border border-[#6BF178]/30 backdrop-blur-sm modern-card">
                    <p className="text-[#DFF2D4] mb-1 font-semibold">Average Mood</p>
                    <div className="text-3xl text-gradient-modern font-bold">
                      {loading ? "..." : `${(weeklyData.reduce((sum, d) => sum + d.mood, 0) / weeklyData.length || 0).toFixed(1)}/10`}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#00F5FF]/20 to-[#A855F7]/20 border border-[#00F5FF]/30 backdrop-blur-sm modern-card">
                    <p className="text-[#DFF2D4] mb-1 font-semibold">Best Day</p>
                    <div className="text-3xl text-gradient-modern font-bold">
                      {loading ? "..." : `${Math.max(...weeklyData.map(d => d.mood), 0).toFixed(1)}/10`}
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6BF178" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6BF178" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFF2D4" opacity={0.1} />
                    <XAxis dataKey="day" stroke="#DFF2D4" />
                    <YAxis stroke="#DFF2D4" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(4, 16, 27, 0.9)",
                        border: "1px solid #6BF178",
                        borderRadius: "12px",
                        boxShadow: "0 0 20px rgba(107, 241, 120, 0.3)",
                        color: "#DFF2D4"
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="#6BF178"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorMood)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6BF178]/20 to-[#00F5FF]/20 border border-[#6BF178]/30 backdrop-blur-sm modern-card">
                <p className="text-[#DFF2D4] mb-2 font-semibold">😊 Mood Insight</p>
                <p className="text-[#DFF2D4]/80">
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
