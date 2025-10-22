import { useState } from "react";
import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { FitterLogo } from "./FitterLogo";
import {
  Activity,
  Heart,
  Zap,
  Moon,
  Droplet,
  TrendingUp,
  TrendingDown,
  Minus,
  Smile,
  Meh,
  Frown,
} from "lucide-react";

export function StatePage() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const metrics = [
    {
      id: "energy",
      name: "Energy Level",
      value: 82,
      unit: "%",
      icon: Zap,
      color: "from-amber-400 to-orange-400",
      bgColor: "from-amber-50 to-orange-50",
      trend: "up",
      trendValue: 8,
      status: "Excellent",
      description: "Your energy is above average today. Keep up the momentum!",
    },
    {
      id: "sleep",
      name: "Sleep Quality",
      value: 7.8,
      unit: "hrs",
      icon: Moon,
      color: "from-indigo-400 to-purple-400",
      bgColor: "from-indigo-50 to-purple-50",
      trend: "up",
      trendValue: 5,
      status: "Good",
      description: "You're getting quality rest. Aim for 8 hours consistently.",
    },
    {
      id: "hydration",
      name: "Hydration",
      value: 2.8,
      unit: "L",
      icon: Droplet,
      color: "from-sky-400 to-cyan-400",
      bgColor: "from-sky-50 to-cyan-50",
      trend: "down",
      trendValue: 10,
      status: "Needs Attention",
      description: "You're slightly below your daily water goal. Drink more!",
    },
    {
      id: "activity",
      name: "Activity",
      value: 8500,
      unit: "steps",
      icon: Activity,
      color: "from-emerald-400 to-teal-400",
      bgColor: "from-emerald-50 to-teal-50",
      trend: "up",
      trendValue: 12,
      status: "Great",
      description: "You're crushing your daily step goal. Well done!",
    },
    {
      id: "heart",
      name: "Heart Rate",
      value: 72,
      unit: "bpm",
      icon: Heart,
      color: "from-rose-400 to-pink-400",
      bgColor: "from-rose-50 to-pink-50",
      trend: "stable",
      trendValue: 0,
      status: "Normal",
      description: "Your resting heart rate is within the healthy range.",
    },
  ];

  const moodOptions = [
    { icon: Smile, label: "Great", color: "text-emerald-500" },
    { icon: Meh, label: "Okay", color: "text-amber-500" },
    { icon: Frown, label: "Low", color: "text-rose-500" },
  ];

  const [currentMood, setCurrentMood] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FitterLogo size={36} />
              <div>
                <h3 className="text-slate-900">State</h3>
                <p className="text-slate-500">Real-time wellness metrics</p>
              </div>
            </div>
            <Badge className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-slate-700 border-0">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Current Mood */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
            <h3 className="mb-4">How are you feeling?</h3>
            <div className="grid grid-cols-3 gap-4">
              {moodOptions.map((mood, index) => {
                const Icon = mood.icon;
                const isSelected = currentMood === index;
                return (
                  <motion.button
                    key={mood.label}
                    onClick={() => setCurrentMood(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-6 rounded-2xl transition-all ${
                      isSelected
                        ? "bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 shadow-lg"
                        : "bg-white/50 border border-white/20"
                    }`}
                  >
                    <Icon className={`w-12 h-12 mx-auto mb-2 ${mood.color}`} />
                    <p className="text-slate-700">{mood.label}</p>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const isSelected = selectedMetric === metric.id;

            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedMetric(isSelected ? null : metric.id)}
              >
                <Card
                  className={`p-6 rounded-3xl border-white/20 backdrop-blur-xl shadow-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white/80 shadow-2xl scale-105"
                      : "bg-white/60 hover:bg-white/70"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${metric.color} flex items-center justify-center`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      {metric.trend === "up" && (
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      )}
                      {metric.trend === "down" && (
                        <TrendingDown className="w-4 h-4 text-rose-500" />
                      )}
                      {metric.trend === "stable" && (
                        <Minus className="w-4 h-4 text-slate-400" />
                      )}
                      <span
                        className={`${
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

                  <h4 className="mb-2 text-slate-900">{metric.name}</h4>

                  <div className="mb-2">
                    <span className={`text-4xl bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                      {metric.value}
                    </span>
                    <span className="text-slate-500 ml-2">{metric.unit}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      className={`rounded-full bg-gradient-to-r ${metric.bgColor} text-slate-700 border-0`}
                    >
                      {metric.status}
                    </Badge>
                  </div>

                  {/* Progress bar for percentage metrics */}
                  {metric.unit === "%" && (
                    <Progress value={metric.value} className="mb-3 h-2" />
                  )}

                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: isSelected ? "auto" : 0,
                      opacity: isSelected ? 1 : 0,
                    }}
                    className="overflow-hidden"
                  >
                    <div className={`mt-4 p-4 rounded-2xl bg-gradient-to-r ${metric.bgColor} border border-white/20`}>
                      <p className="text-slate-700">{metric.description}</p>
                    </div>
                  </motion.div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Daily Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
            <h3 className="mb-4">Daily Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100/50">
                <p className="text-slate-600 mb-1">Overall Score</p>
                <div className="text-2xl bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                  85/100
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                <p className="text-slate-600 mb-1">Streak</p>
                <div className="text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  12 days
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50">
                <p className="text-slate-600 mb-1">Goals Met</p>
                <div className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  4/6
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50">
                <p className="text-slate-600 mb-1">Wellness</p>
                <div className="text-2xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Great
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
