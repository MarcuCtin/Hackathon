import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { FitterLogo } from "./FitterLogo";
import { UserAvatar } from "./UserAvatar";
import { api } from "../lib/api";
import { toast } from "sonner";
import {
  Save,
  ArrowLeft,
  Smile,
  Frown,
  Meh,
  Zap,
  Moon,
  Heart,
  Brain,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

interface ReflectionPageProps {
  onBack?: () => void;
  onProfileClick?: () => void;
  fromBottomNav?: boolean;
}

type MoodOption = "calm" | "stressed" | "focused" | "energized" | "tired" | "motivated" | "anxious" | "content";
type SleepQuality = "excellent" | "good" | "fair" | "poor";

const moodOptions: { value: MoodOption; label: string; emoji: string; color: string }[] = [
  { value: "calm", label: "Calm", emoji: "😌", color: "bg-blue-500" },
  { value: "stressed", label: "Stressed", emoji: "😩", color: "bg-red-500" },
  { value: "focused", label: "Focused", emoji: "🧠", color: "bg-purple-500" },
  { value: "energized", label: "Energized", emoji: "⚡", color: "bg-yellow-500" },
  { value: "tired", label: "Tired", emoji: "😴", color: "bg-gray-500" },
  { value: "motivated", label: "Motivated", emoji: "💪", color: "bg-green-500" },
  { value: "anxious", label: "Anxious", emoji: "😟", color: "bg-orange-500" },
  { value: "content", label: "Content", emoji: "😊", color: "bg-teal-500" },
];

const sleepQualityOptions: { value: SleepQuality; label: string; emoji: string }[] = [
  { value: "excellent", label: "Excellent", emoji: "🌟" },
  { value: "good", label: "Good", emoji: "✨" },
  { value: "fair", label: "Fair", emoji: "💤" },
  { value: "poor", label: "Poor", emoji: "😴" },
];

export function ReflectionPage({ onBack, onProfileClick, fromBottomNav = false }: ReflectionPageProps) {
  const [mood, setMood] = useState<MoodOption | null>(null);
  const [energyLevel, setEnergyLevel] = useState(50);
  const [stressLevel, setStressLevel] = useState(50);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasReflection, setHasReflection] = useState(false);

  useEffect(() => {
    const fetchTodayReflection = async () => {
      try {
        const response = await api.getTodayReflection();
        if (response.success && response.data) {
          setMood(response.data.mood);
          setEnergyLevel(response.data.energyLevel);
          setStressLevel(response.data.stressLevel);
          setSleepQuality(response.data.sleepQuality);
          setNotes(response.data.notes || "");
          setHasReflection(true);
        }
      } catch (error) {
        console.error("Failed to fetch reflection:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayReflection();
  }, []);

  const handleSave = async () => {
    if (!mood || !sleepQuality) {
      toast.error("Please select mood and sleep quality");
      return;
    }

    setIsSaving(true);
    try {
      await api.saveReflection({
        mood,
        energyLevel,
        stressLevel,
        sleepQuality,
        notes: notes.trim() || undefined,
      });
      toast.success("Reflection saved! 🎉");
      setHasReflection(true);
    } catch (error) {
      console.error("Failed to save reflection:", error);
      toast.error("Failed to save reflection");
    } finally {
      setIsSaving(false);
    }
  };

  const getEnergyColor = (level: number) => {
    if (level >= 80) return "text-green-400";
    if (level >= 60) return "text-yellow-400";
    if (level >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getStressColor = (level: number) => {
    if (level >= 80) return "text-red-400";
    if (level >= 60) return "text-orange-400";
    if (level >= 40) return "text-yellow-400";
    return "text-green-400";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-modern flex items-center justify-center">
        <div className="text-center">
          <FitterLogo size={64} />
          <p className="text-[#DFF2D4] text-lg mt-4">Loading reflection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-modern relative ${fromBottomNav ? 'pb-24 md:pb-28' : 'pb-6'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-[#6BF178]/30 bg-[#04101B]/98 shadow-[0_4px_30px_rgba(107,241,120,0.15)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!fromBottomNav && onBack && (
                <button onClick={onBack} className="hover:scale-110 transition-transform">
                  <ArrowLeft className="w-6 h-6 text-[#DFF2D4]" />
                </button>
              )}
              <FitterLogo size={36} />
            </div>
            <div className="flex items-center gap-4">
              {hasReflection && (
                <Badge className="rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Saved
                </Badge>
              )}
              <button onClick={onProfileClick} className="focus:outline-none">
                <UserAvatar size={40} userName="User" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6BF178] to-[#E2F163] bg-clip-text text-transparent mb-2">
            Daily Reflection
          </h1>
          <p className="text-[#DFF2D4]/80 text-lg">How are you feeling today?</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Mood Selection */}
          <Card className="modern-card glass-card-intense p-6 border-2 border-[#6BF178]/30">
            <h2 className="text-xl font-semibold text-[#DFF2D4] mb-4 flex items-center gap-2">
              <Smile className="w-5 h-5 text-[#6BF178]" /> Your Mood
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {moodOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={`flex flex-col items-center justify-center p-4 h-auto rounded-xl transition-all duration-200
                    ${mood === option.value
                      ? `bg-gradient-to-br from-[#6BF178] to-[#E2F163] text-[#04101B] border-2 border-white/50 shadow-[0_0_20px_rgba(107,241,120,0.4)] scale-105`
                      : `bg-[#0a1f33]/60 border border-[#6BF178]/30 text-[#DFF2D4]/80 hover:bg-[#0a1f33]/80 hover:border-[#6BF178]/60 hover:scale-105`
                    }`}
                  onClick={() => setMood(option.value)}
                >
                  <span className="text-3xl mb-1">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Energy Level */}
          <Card className="modern-card glass-card-intense p-6 border-2 border-[#6BF178]/30">
            <h2 className="text-xl font-semibold text-[#DFF2D4] mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#E2F163]" /> Energy Level
            </h2>
            <div className="flex items-center gap-4">
              <Slider
                value={[energyLevel]}
                max={100}
                step={1}
                onValueChange={(val) => setEnergyLevel(val[0])}
                className="flex-1 [&>span:first-child]:h-2 [&>span:first-child]:bg-[#0a1f33]/60 [&>span:first-child]:rounded-full [&>span:first-child>span]:bg-gradient-to-r from-[#E2F163] to-[#6BF178] [&>span:first-child>span]:h-full [&>span:first-child>span]:rounded-full [&>span:first-child>span]:shadow-[0_0_15px_rgba(226,241,99,0.6)] [&>span:last-child]:w-5 [&>span:last-child]:h-5 [&>span:last-child]:bg-white [&>span:last-child]:border-2 [&>span:last-child]:border-[#6BF178] [&>span:last-child]:shadow-[0_0_20px_rgba(107,241,120,0.8)]"
              />
              <span className={`text-2xl font-bold ${getEnergyColor(energyLevel)} w-16 text-right`}>
                {energyLevel}%
              </span>
            </div>
            <Progress value={energyLevel} className="mt-4 h-2 bg-[#0a1f33]/60 [&>div]:bg-gradient-to-r [&>div]:from-[#E2F163] [&>div]:to-[#6BF178] [&>div]:shadow-[0_0_15px_rgba(226,241,99,0.6)]" />
          </Card>

          {/* Stress Level */}
          <Card className="modern-card glass-card-intense p-6 border-2 border-[#6BF178]/30">
            <h2 className="text-xl font-semibold text-[#DFF2D4] mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-red-400" /> Stress Level
            </h2>
            <div className="flex items-center gap-4">
              <Slider
                value={[stressLevel]}
                max={100}
                step={1}
                onValueChange={(val) => setStressLevel(val[0])}
                className="flex-1 [&>span:first-child]:h-2 [&>span:first-child]:bg-[#0a1f33]/60 [&>span:first-child]:rounded-full [&>span:first-child>span]:bg-gradient-to-r from-red-500 to-orange-500 [&>span:first-child>span]:h-full [&>span:first-child>span]:rounded-full [&>span:first-child>span]:shadow-[0_0_15px_rgba(255,99,71,0.6)] [&>span:last-child]:w-5 [&>span:last-child]:h-5 [&>span:last-child]:bg-white [&>span:last-child]:border-2 [&>span:last-child]:border-red-500 [&>span:last-child]:shadow-[0_0_20px_rgba(255,99,71,0.8)]"
              />
              <span className={`text-2xl font-bold ${getStressColor(stressLevel)} w-16 text-right`}>
                {stressLevel}%
              </span>
            </div>
            <Progress value={stressLevel} className="mt-4 h-2 bg-[#0a1f33]/60 [&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-orange-500 [&>div]:shadow-[0_0_15px_rgba(255,99,71,0.6)]" />
          </Card>

          {/* Sleep Quality */}
          <Card className="modern-card glass-card-intense p-6 border-2 border-[#6BF178]/30">
            <h2 className="text-xl font-semibold text-[#DFF2D4] mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5 text-blue-400" /> Sleep Quality
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {sleepQualityOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={`flex flex-col items-center justify-center p-4 h-auto rounded-xl transition-all duration-200
                    ${sleepQuality === option.value
                      ? `bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-2 border-white/50 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105`
                      : `bg-[#0a1f33]/60 border border-[#6BF178]/30 text-[#DFF2D4]/80 hover:bg-[#0a1f33]/80 hover:border-[#6BF178]/60 hover:scale-105`
                    }`}
                  onClick={() => setSleepQuality(option.value)}
                >
                  <span className="text-3xl mb-1">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Notes */}
          <Card className="modern-card glass-card-intense p-6 border-2 border-[#6BF178]/30">
            <h2 className="text-xl font-semibold text-[#DFF2D4] mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" /> Notes (Optional)
            </h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional thoughts or observations about your day?"
              className="bg-[#0a1f33]/60 border border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178] focus:ring-0 min-h-[100px]"
            />
          </Card>

          {/* Save Button */}
          <div className="text-center mt-8">
            <Button
              onClick={handleSave}
              disabled={isSaving || !mood || !sleepQuality}
              className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] border-0 shadow-[0_0_20px_rgba(107,241,120,0.4)] hover:shadow-[0_0_30px_rgba(107,241,120,0.6)] transition-all text-lg px-8 py-3"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-[#04101B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Reflection
                </span>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
