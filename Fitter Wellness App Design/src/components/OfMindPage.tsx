import { useState } from "react";
import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { FitterLogo } from "./FitterLogo";
import {
  Brain,
  Heart,
  Sparkles,
  Music,
  Leaf,
  Sun,
  Wind,
  Volume2,
  Play,
  Pause,
  SkipForward,
} from "lucide-react";

export function OfMindPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("meditation");
  const [moodSlider, setMoodSlider] = useState([7]);
  const [stressSlider, setStressSlider] = useState([4]);

  const activities = [
    {
      id: "meditation",
      name: "Guided Meditation",
      duration: "10 min",
      icon: Brain,
      gradient: "from-violet-400 to-purple-400",
      bgGradient: "from-violet-50 to-purple-50",
      description: "Calm your mind with guided breathing exercises",
    },
    {
      id: "breathing",
      name: "Deep Breathing",
      duration: "5 min",
      icon: Wind,
      gradient: "from-sky-400 to-cyan-400",
      bgGradient: "from-sky-50 to-cyan-50",
      description: "Simple breathing patterns to reduce stress",
    },
    {
      id: "music",
      name: "Calm Music",
      duration: "15 min",
      icon: Music,
      gradient: "from-emerald-400 to-teal-400",
      bgGradient: "from-emerald-50 to-teal-50",
      description: "Soothing sounds for relaxation and focus",
    },
    {
      id: "nature",
      name: "Nature Sounds",
      duration: "20 min",
      icon: Leaf,
      gradient: "from-green-400 to-emerald-400",
      bgGradient: "from-green-50 to-emerald-50",
      description: "Peaceful natural soundscapes",
    },
  ];

  const insights = [
    {
      title: "Morning Routine",
      time: "7:00 AM",
      description: "Start with 5-minute meditation",
      icon: Sun,
      color: "from-amber-400 to-orange-400",
    },
    {
      title: "Stress Level",
      time: "Today",
      description: "Lower than yesterday by 20%",
      icon: Heart,
      color: "from-rose-400 to-pink-400",
    },
    {
      title: "Mindfulness Score",
      time: "This Week",
      description: "88/100 - Excellent progress",
      icon: Sparkles,
      color: "from-violet-400 to-purple-400",
    },
  ];

  const currentActivity = activities.find((a) => a.id === selectedActivity);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 pb-24">
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FitterLogo size={36} />
              <div>
                <h3 className="text-slate-900">Of Mind</h3>
                <p className="text-slate-500">Mental wellness & mindfulness</p>
              </div>
            </div>
            <Badge className="rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-slate-700 border-0">
              <Brain className="w-3 h-3 mr-1" />
              Zen Mode
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
            <h3 className="mb-6">How's your mind today?</h3>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-slate-700">Mood Level</label>
                  <Badge className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-slate-700 border-0">
                    {moodSlider[0]}/10
                  </Badge>
                </div>
                <Slider
                  value={moodSlider}
                  onValueChange={setMoodSlider}
                  max={10}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-slate-500">
                  <span>😔 Low</span>
                  <span>😊 High</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-slate-700">Stress Level</label>
                  <Badge className="rounded-full bg-gradient-to-r from-rose-100 to-pink-100 text-slate-700 border-0">
                    {stressSlider[0]}/10
                  </Badge>
                </div>
                <Slider
                  value={stressSlider}
                  onValueChange={setStressSlider}
                  max={10}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-slate-500">
                  <span>😌 Calm</span>
                  <span>😰 Stressed</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="mb-4">Mindfulness Activities</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              const isSelected = selectedActivity === activity.id;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedActivity(activity.id)}
                >
                  <Card
                    className={`p-6 rounded-3xl backdrop-blur-xl shadow-xl cursor-pointer transition-all ${
                      isSelected
                        ? `bg-gradient-to-br ${activity.bgGradient} border-2 border-white/50 shadow-2xl`
                        : "bg-white/60 border border-white/20 hover:bg-white/80"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${activity.gradient} flex items-center justify-center`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <Badge className="rounded-full bg-white/80 text-slate-700 border-0">
                        {activity.duration}
                      </Badge>
                    </div>
                    <h4 className="mb-2">{activity.name}</h4>
                    <p className="text-slate-600">{activity.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {currentActivity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card
              className={`p-8 rounded-3xl border-white/20 backdrop-blur-xl shadow-2xl bg-gradient-to-br ${currentActivity.bgGradient}`}
            >
              <div className="text-center mb-8">
                <motion.div
                  className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${currentActivity.gradient} flex items-center justify-center`}
                  animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <currentActivity.icon className="w-12 h-12 text-white" />
                </motion.div>
                <h3 className="mb-2">{currentActivity.name}</h3>
                <p className="text-slate-600">{currentActivity.description}</p>
              </div>

              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-14 h-14 rounded-full border-slate-200"
                >
                  <SkipForward className="w-5 h-5 rotate-180" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-20 h-20 rounded-full bg-gradient-to-r ${currentActivity.gradient} hover:opacity-90 shadow-lg`}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-14 h-14 rounded-full border-slate-200"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-slate-500" />
                <Slider defaultValue={[70]} max={100} step={1} className="flex-1" />
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="mb-4">Mindfulness Insights</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
                    <div
                      className={`w-12 h-12 mb-4 rounded-2xl bg-gradient-to-r ${insight.color} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="mb-1">{insight.title}</h4>
                    <p className="text-slate-500 mb-2">{insight.time}</p>
                    <p className="text-slate-700">{insight.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
