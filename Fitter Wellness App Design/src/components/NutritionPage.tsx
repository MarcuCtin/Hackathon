import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { FitterLogo } from "./FitterLogo";
import { NutritionRecommender } from "./NutritionRecommender";
import { MealLogForm } from "./MealLogForm";
import { UserAvatar } from "./UserAvatar";
import { api } from "../lib/api";
import { Utensils, Droplets, Zap, TrendingUp, Apple, Coffee, Clock, ChevronRight, Trash2, Sparkles, CheckCircle2, Star, Calendar, Pause, Play, X } from "lucide-react";

interface MealLog {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  items: string[];
  suggestedByAi?: boolean;
}

interface SuggestedMeal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  items: string[];
  emoji: string;
  consumed?: boolean;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
}

interface NutritionPageProps {
  onProfileClick?: () => void;
}

export function NutritionPage({ onProfileClick }: NutritionPageProps) {
  const [loggedMeals, setLoggedMeals] = useState<MealLog[]>([]);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<SuggestedMeal[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [userTargets, setUserTargets] = useState<any>(null);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [consumedSuggestions, setConsumedSuggestions] = useState<Set<string>>(() => {
    // Load consumed suggestions from localStorage
    const stored = localStorage.getItem('consumedSuggestions');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Listen for changes in localStorage for consumed suggestions
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('consumedSuggestions');
      if (stored) {
        setConsumedSuggestions(new Set(JSON.parse(stored)));
      }
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically for changes within same tab
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Fetch nutrition data
  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        setIsLoading(true);
        const [todayResponse, nutritionLogsResponse] = await Promise.all([
          api.getNutritionPageToday(),
          api.getNutritionLogs(),
        ]);
        
        if (todayResponse.success) {
          setNutritionData(todayResponse.data);
        }
        
        if (nutritionLogsResponse.success && nutritionLogsResponse.data) {
          const meals = nutritionLogsResponse.data.map((log: any, idx: number) => ({
            id: log._id || idx.toString(),
            name: log.mealType.charAt(0).toUpperCase() + log.mealType.slice(1),
            time: new Date(log.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            calories: log.total?.calories || 0,
            protein: log.total?.protein || 0,
            items: log.items?.map((item: any) => item.name) || [],
            suggestedByAi: log.suggestedByAi || false,
          }));
          setLoggedMeals(meals);
        }
      } catch (error) {
        console.error("Failed to fetch nutrition data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNutritionData();
  }, []);

  // Fetch user targets on page load and periodically refresh
  useEffect(() => {
    const fetchUserTargets = async () => {
      try {
        const response = await api.getUserTargets();
        if (response.success && response.data) {
          setUserTargets(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user targets:", error);
      }
    };
    
    fetchUserTargets();
    
    // Refresh every 5 seconds to catch AI updates
    const interval = setInterval(fetchUserTargets, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch active plan on page load and refresh periodically
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
    
    // Refresh every 5 seconds to catch new plans
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

  // Fetch AI meal suggestions on page load
  useEffect(() => {
    const fetchAiSuggestions = async () => {
      try {
        setIsLoadingSuggestions(true);
        const response = await api.getMealSuggestions();
        
        if (response.success && response.data.suggestions) {
          setAiSuggestions(response.data.suggestions);
        }
      } catch (error) {
        console.error("Failed to fetch AI meal suggestions:", error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };
    
    fetchAiSuggestions();
  }, []);

  // Daily targets from user targets or nutrition data
  const dailyTargets = useMemo(() => {
    return {
      calories: userTargets?.calories?.target || nutritionData?.calories?.target || 2200,
      protein: userTargets?.protein?.target || nutritionData?.protein?.target || 120,
      carbs: userTargets?.carbs?.target || nutritionData?.carbs?.target || 150,
      fat: userTargets?.fat?.target || nutritionData?.fat?.target || 70,
      water: userTargets?.water?.target || nutritionData?.water?.target || 3.0,
      caffeine: userTargets?.caffeine?.target || nutritionData?.caffeine?.target || 300,
    };
  }, [userTargets, nutritionData]);

  // Calculate consumed nutrition from real data
  const consumed = useMemo(() => {
    return {
      calories: nutritionData?.calories?.current || 0,
      protein: nutritionData?.protein?.current || 0,
      carbs: nutritionData?.carbs?.current || 0,
      fat: nutritionData?.fat?.current || 0,
      water: nutritionData?.water?.current || 0,
      caffeine: nutritionData?.caffeine?.current || 0,
    };
  }, [nutritionData]);

  // Calculate remaining nutrition needed
  const remaining = {
    calories: dailyTargets.calories - consumed.calories,
    protein: dailyTargets.protein - consumed.protein,
    carbs: dailyTargets.carbs - consumed.carbs,
    fat: dailyTargets.fat - consumed.fat,
    water: dailyTargets.water - consumed.water,
    caffeine: dailyTargets.caffeine - consumed.caffeine,
  };

  // Use AI-generated meal suggestions or fallback to empty array
  const suggestedMeals = aiSuggestions.length > 0 ? aiSuggestions : [];

  // Get next meal
  const nextMeal = suggestedMeals[0];

  const handleAddMeal = (meal: MealLog) => {
    setLoggedMeals([...loggedMeals, meal]);
  };

  const handleDeleteMeal = (id: string) => {
    setLoggedMeals(loggedMeals.filter((m) => m.id !== id));
  };

  const handlePausePlan = async () => {
    if (!activePlan) return;
    try {
      await api.updatePlanStatus(activePlan._id, 'paused');
      setActivePlan({ ...activePlan, status: 'paused' });
      toast.success("Plan paused");
    } catch (error) {
      console.error("Failed to pause plan:", error);
      toast.error("Failed to pause plan");
    }
  };

  const handleResumePlan = async () => {
    if (!activePlan) return;
    try {
      await api.updatePlanStatus(activePlan._id, 'active');
      setActivePlan({ ...activePlan, status: 'active' });
      toast.success("Plan resumed");
    } catch (error) {
      console.error("Failed to resume plan:", error);
      toast.error("Failed to resume plan");
    }
  };

  const handleCancelPlan = async () => {
    if (!activePlan) return;
    try {
      await api.updatePlanStatus(activePlan._id, 'cancelled');
      setActivePlan(null);
      toast.success("Plan cancelled");
    } catch (error) {
      console.error("Failed to cancel plan:", error);
      toast.error("Failed to cancel plan");
    }
  };

  const handleConsumeSuggestedMeal = async (meal: SuggestedMeal) => {
    // Mark as consumed in localStorage first
    const consumedMeals = JSON.parse(localStorage.getItem('consumedSuggestions') || '[]');
    if (!consumedMeals.includes(meal.id)) {
      consumedMeals.push(meal.id);
      localStorage.setItem('consumedSuggestions', JSON.stringify(consumedMeals));
    }
    
    // Mark as consumed in UI
    setConsumedSuggestions(new Set([...consumedSuggestions, meal.id]));
    
    // Log the meal automatically via AI chat
    try {
      const mealDescription = meal.items.join(", ");
      const response = await api.chat([
        {
          role: "user",
          content: `I just ate the ${meal.name.toLowerCase()} you suggested: ${mealDescription}`
        }
      ]);
      
      // Refresh nutrition data
      const [todayResponse, nutritionLogsResponse] = await Promise.all([
        api.getNutritionPageToday(),
        api.getNutritionLogs(),
      ]);
      
      if (todayResponse.success) {
        setNutritionData(todayResponse.data);
      }
      
      if (nutritionLogsResponse.success && nutritionLogsResponse.data) {
        const meals = nutritionLogsResponse.data.map((log: any, idx: number) => ({
          id: log._id || idx.toString(),
          name: log.mealType.charAt(0).toUpperCase() + log.mealType.slice(1),
          time: new Date(log.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          calories: log.total?.calories || 0,
          protein: log.total?.protein || 0,
          items: log.items?.map((item: any) => item.name) || [],
          suggestedByAi: log.suggestedByAi || false,
        }));
        setLoggedMeals(meals);
      }
    } catch (error) {
      console.error("Failed to log suggested meal:", error);
    }
  };

  const nutritionStats = [
    {
      icon: Apple,
      label: "Calories",
      value: consumed.calories.toString(),
      target: dailyTargets.calories.toString(),
      unit: "kcal",
      gradient: "from-rose-400 to-pink-400",
      bgGradient: "from-rose-50 to-pink-50",
    },
    {
      icon: Zap,
      label: "Protein",
      value: consumed.protein.toString(),
      target: dailyTargets.protein.toString(),
      unit: "g",
      gradient: "from-amber-400 to-orange-400",
      bgGradient: "from-amber-50 to-orange-50",
    },
    {
      icon: Droplets,
      label: "Water",
      value: consumed.water.toFixed(1),
      target: dailyTargets.water.toString(),
      unit: "L",
      gradient: "from-sky-400 to-cyan-400",
      bgGradient: "from-sky-50 to-cyan-50",
    },
    {
      icon: Coffee,
      label: "Caffeine",
      value: consumed.caffeine.toString(),
      target: dailyTargets.caffeine.toString(),
      unit: "mg",
      gradient: "from-amber-600 to-yellow-600",
      bgGradient: "from-amber-50 to-yellow-50",
    },
  ];

  // Micronutrients data from nutritionData or userTargets
  const micronutrients = nutritionData?.micronutrients || {};
  const micronutrientStats = useMemo(() => [
    { name: "Vitamin D", current: micronutrients.vitaminD?.current || 0, target: userTargets?.vitaminD?.target || micronutrients.vitaminD?.target || 15, unit: "mcg", emoji: "☀️" },
    { name: "Calcium", current: micronutrients.calcium?.current || 0, target: userTargets?.calcium?.target || micronutrients.calcium?.target || 1000, unit: "mg", emoji: "🥛" },
    { name: "Magnesium", current: micronutrients.magnesium?.current || 0, target: userTargets?.magnesium?.target || micronutrients.magnesium?.target || 400, unit: "mg", emoji: "🌰" },
    { name: "Iron", current: micronutrients.iron?.current || 0, target: userTargets?.iron?.target || micronutrients.iron?.target || 18, unit: "mg", emoji: "🩸" },
    { name: "Zinc", current: micronutrients.zinc?.current || 0, target: userTargets?.zinc?.target || micronutrients.zinc?.target || 11, unit: "mg", emoji: "💊" },
    { name: "Omega-3", current: micronutrients.omega3?.current || 0, target: userTargets?.omega3?.target || micronutrients.omega3?.target || 1000, unit: "mg", emoji: "🐟" },
    { name: "B12", current: micronutrients.b12?.current || 0, target: userTargets?.b12?.target || micronutrients.b12?.target || 2.4, unit: "mcg", emoji: "🔬" },
    { name: "Folate", current: micronutrients.folate?.current || 0, target: userTargets?.folate?.target || micronutrients.folate?.target || 400, unit: "mcg", emoji: "🥬" },
  ], [micronutrients, userTargets]);

  return (
    <div className="min-h-screen bg-gradient-modern relative pb-24">
      {/* Header with Next Meal */}
      <header className="sticky top-0 z-50 border-b-2 border-[#6BF178]/30 bg-[#04101B]/98 backdrop-blur-3xl shadow-[0_4px_30px_rgba(107,241,120,0.15)]">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <FitterLogo size={40} />
                <div className="absolute -inset-1 bg-gradient-to-r from-[#6BF178] to-[#E2F163] rounded-full opacity-20 blur-md"></div>
              </div>
              <div>
                <h3 className="text-[#6BF178] font-bold text-xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] bg-clip-text text-transparent">Nutrition</h3>
                <p className="text-[#DFF2D4]/80 text-sm font-medium">Smart meal & supplement guidance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] border-0 font-semibold shadow-[0_0_15px_rgba(107,241,120,0.4)] px-3 py-1">
                <Utensils className="w-3 h-3 mr-1" />
                Today
              </Badge>
          {activePlan ? (
            <Badge className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 font-semibold shadow-[0_0_15px_rgba(168,85,247,0.4)] px-3 py-1 whitespace-nowrap">
              {activePlan.planType === 'cutting' && '🔥'}
              {activePlan.planType === 'bulking' && '💪'}
              {activePlan.planType === 'maintenance' && '⚖️'}
              {activePlan.planType === 'healing' && '💚'}
              {activePlan.planType === 'custom' && '✨'}
              {' '}{activePlan.planName}
            </Badge>
          ) : (
            <Badge className="rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50 font-medium whitespace-nowrap px-3 py-1">
              📋 Currently no plan set
            </Badge>
          )}
              <button 
                onClick={onProfileClick} 
                className="focus:outline-none hover:scale-110 transition-transform duration-300 relative group"
              >
                <UserAvatar size={40} userName="Alex Thompson" />
                <div className="absolute -inset-1 bg-gradient-to-r from-[#6BF178] to-[#E2F163] rounded-full opacity-0 group-hover:opacity-30 blur-md transition-opacity"></div>
              </button>
            </div>
          </div>

          {/* Next Meal Card */}
          {nextMeal && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <Card className="modern-card glass-card-intense p-4 rounded-2xl hover-lift overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6BF178] to-[#E2F163] flex items-center justify-center glow-effect-green">
                      <Utensils className="w-6 h-6 text-[#04101B]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#DFF2D4]">Next: {nextMeal.name}</span>
                        <Badge className="rounded-full bg-gradient-to-r from-[#E2F163] to-[#6BF178] text-[#04101B] border-0 font-semibold shadow-[0_0_10px_rgba(226,241,99,0.4)]">
                          <Clock className="w-3 h-3 mr-1" />
                          {nextMeal.time}
                        </Badge>
                      </div>
                      <p className="text-[#DFF2D4]/80 text-sm">
                        {nextMeal.calories} kcal · {nextMeal.protein}g protein
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6BF178]" />
                </div>
              </Card>
            </motion.div>
          )}

          {/* Current Plan Card */}
          {activePlan && (() => {
            const currentWeek = Math.floor((new Date().getTime() - new Date(activePlan.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
            const weeksRemaining = Math.max(0, activePlan.durationWeeks - currentWeek + 1);
            const progressPercentage = Math.min(100, (currentWeek / activePlan.durationWeeks) * 100);
            
            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3"
              >
                <Card className="modern-card glass-card-intense p-4 rounded-2xl hover-lift overflow-hidden border-purple-500/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 font-semibold shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                          {activePlan.planType === 'cutting' && '🔥 Cutting'}
                          {activePlan.planType === 'bulking' && '💪 Bulking'}
                          {activePlan.planType === 'maintenance' && '⚖️ Maintenance'}
                          {activePlan.planType === 'healing' && '💚 Healing'}
                          {activePlan.planType === 'custom' && '✨ Custom'}
                        </Badge>
                        <span className="text-[#DFF2D4] font-semibold">{activePlan.planName}</span>
                        {activePlan.status === 'paused' && (
                          <Badge className="rounded-full bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            ⏸️ Paused
                          </Badge>
                        )}
                      </div>
                      {activePlan.description && (
                        <p className="text-[#DFF2D4]/80 text-sm mb-2">{activePlan.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-[#DFF2D4]/70 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Week {currentWeek} / {activePlan.durationWeeks}
                        </span>
                        <span>·</span>
                        <span>{activePlan.targetCalories} kcal/day</span>
                        <span>·</span>
                        <span>{activePlan.targetProtein}g protein</span>
                      </div>
                      {activePlan.primaryGoal && (
                        <p className="text-[#DFF2D4]/60 text-xs mb-2">
                          🎯 {activePlan.primaryGoal}
                        </p>
                      )}
                      {/* Progress bar */}
                      <div className="relative h-2 bg-[#DFF2D4]/20 rounded-full border border-purple-500/30 mt-2">
                        <motion.div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${progressPercentage}%`,
                            background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                            boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <p className="text-[#DFF2D4]/50 text-xs mt-1">{weeksRemaining} weeks remaining</p>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 mt-3">
                        {activePlan.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePausePlan}
                            className="rounded-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs h-7"
                          >
                            <Pause className="w-3 h-3 mr-1" />
                            Pause
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleResumePlan}
                            className="rounded-full border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs h-7"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Resume
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelPlan}
                          className="rounded-full border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-7"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })()}
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 relative z-10">
        {/* Nutrition Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="mb-4 text-gradient-modern text-glow text-lg font-bold">Today's Nutrition</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nutritionStats.map((stat, index) => {
              const Icon = stat.icon;
              const percentage = (parseInt(stat.value) / parseInt(stat.target)) * 100;

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="modern-card glass-card-intense p-5 rounded-3xl hover-lift overflow-hidden">
                    <div className="w-12 h-12 mb-3 rounded-2xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] flex items-center justify-center glow-effect-green pulse-modern">
                      <Icon className="w-6 h-6 text-[#04101B]" />
                    </div>
                    <p className="text-[#DFF2D4] mb-1 font-semibold">{stat.label}</p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl text-gradient-modern font-bold">
                        {stat.value}
                      </span>
                      <span className="text-[#DFF2D4]/70">/ {stat.target}</span>
                      <span className="text-[#DFF2D4]/50">{stat.unit}</span>
                    </div>
                    <div className="relative h-3 bg-[#DFF2D4]/20 rounded-full border border-[#6BF178]/30">
                      <motion.div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          background: 'linear-gradient(90deg, #6BF178, #E2F163)',
                          boxShadow: '0 0 15px rgba(107, 241, 120, 0.6)'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Micronutrients Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h3 className="mb-4 text-gradient-modern text-glow text-lg font-bold">Essential Micronutrients</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {micronutrientStats.map((vitamin, index) => {
              const percentage = (vitamin.current / vitamin.target) * 100;
              return (
                <motion.div
                  key={vitamin.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <Card className="modern-card glass-card-intense p-4 rounded-2xl hover-lift overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{vitamin.emoji}</span>
                      <p className="text-[#DFF2D4] text-sm font-semibold">{vitamin.name}</p>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-lg text-gradient-modern font-bold">
                        {vitamin.current.toFixed(1)}
                      </span>
                      <span className="text-[#DFF2D4]/70 text-xs">/ {vitamin.target}</span>
                      <span className="text-[#DFF2D4]/50 text-xs">{vitamin.unit}</span>
                    </div>
                    <div className="relative h-2 bg-[#DFF2D4]/20 rounded-full border border-[#6BF178]/30">
                      <motion.div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          background: percentage >= 100 
                            ? 'linear-gradient(90deg, #10b981, #059669)'
                            : 'linear-gradient(90deg, #6BF178, #E2F163)',
                          boxShadow: '0 0 10px rgba(107, 241, 120, 0.5)'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1, delay: 0.6 + index * 0.05 }}
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Meal Log Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-6"
        >
          <MealLogForm onAddMeal={handleAddMeal} />
        </motion.div>

        {/* Logged Meals */}
        {loggedMeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mb-6"
          >
            <h3 className="mb-4 text-gradient-modern text-glow text-lg font-bold">Meals Eaten Today</h3>
            <div className="space-y-3">
              <AnimatePresence>
                {loggedMeals.map((meal, index) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="modern-card glass-card-intense p-5 rounded-3xl hover-lift overflow-hidden group">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6BF178] to-[#E2F163] flex items-center justify-center flex-shrink-0 glow-effect-green">
                          {meal.name.toLowerCase().includes("breakfast") ? <Coffee className="w-6 h-6 text-[#04101B]" /> :
                           meal.name.toLowerCase().includes("lunch") ? <Apple className="w-6 h-6 text-[#04101B]" /> :
                           meal.name.toLowerCase().includes("dinner") ? <Utensils className="w-6 h-6 text-[#04101B]" /> : <Utensils className="w-6 h-6 text-[#04101B]" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-[#DFF2D4] font-semibold">{meal.name}</h4>
                                {meal.suggestedByAi && (
                                  <Star className="w-4 h-4 text-[#6BF178] fill-[#6BF178]" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[#DFF2D4]/70">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {meal.time}
                                </span>
                                <Badge className="rounded-full bg-gradient-to-r from-[#E2F163] to-[#6BF178] text-[#04101B] border-0 font-semibold shadow-[0_0_10px_rgba(226,241,99,0.4)]">
                                  {meal.calories} kcal
                                </Badge>
                                {meal.protein > 0 && (
                                  <Badge className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#DFF2D4] text-[#04101B] border-0 font-semibold shadow-[0_0_10px_rgba(107,241,120,0.4)]">
                                    {meal.protein}g protein
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FF006E]/20"
                            >
                              <Trash2 className="w-4 h-4 text-[#DFF2D4]/60 hover:text-[#FF006E]" />
                            </Button>
                          </div>

                          <div className="space-y-1">
                            {meal.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-[#DFF2D4]/80">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163]" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Supplement Recommender */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mb-6"
        >
          <NutritionRecommender />
        </motion.div>

        {/* Suggested Meals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gradient-modern text-glow text-lg font-bold">Suggested Meals</h3>
            <Badge className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] border-0 font-semibold shadow-[0_0_15px_rgba(107,241,120,0.4)]">
              {remaining.calories > 0 ? `${remaining.calories} kcal remaining` : "Goal reached!"}
            </Badge>
          </div>

          {isLoadingSuggestions ? (
            <Card className="modern-card glass-card-intense p-8 rounded-3xl text-center">
              <div className="animate-spin mx-auto mb-4 w-12 h-12 border-4 border-[#6BF178] border-t-transparent rounded-full" />
              <p className="text-[#DFF2D4]/80">AI is analyzing your nutrition and generating personalized meal suggestions...</p>
            </Card>
          ) : remaining.calories > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {suggestedMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                >
                  <Card className={`modern-card glass-card-intense p-6 rounded-3xl hover-lift overflow-hidden relative ${consumedSuggestions.has(meal.id) ? 'opacity-75' : ''}`}>
                    {consumedSuggestions.has(meal.id) && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle2 className="w-8 h-8 text-[#6BF178] fill-[#6BF178]/20" />
                      </div>
                    )}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6BF178] to-[#E2F163] flex items-center justify-center glow-effect-green">
                        <Utensils className="w-6 h-6 text-[#04101B]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1 text-[#DFF2D4] font-semibold">{meal.name}</h4>
                        <p className="text-[#DFF2D4]/70 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meal.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="rounded-full bg-gradient-to-r from-[#E2F163] to-[#6BF178] text-[#04101B] border-0 mb-1 font-semibold shadow-[0_0_10px_rgba(226,241,99,0.4)]">
                          {meal.calories} kcal
                        </Badge>
                        <div className="text-sm text-[#DFF2D4]/70 font-medium">{meal.protein}g protein</div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {meal.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-[#DFF2D4]/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {!consumedSuggestions.has(meal.id) && (
                      <Button
                        onClick={() => handleConsumeSuggestedMeal(meal)}
                        className="w-full rounded-2xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] hover:shadow-[0_0_20px_rgba(107,241,120,0.5)] font-semibold"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        I ate this
                      </Button>
                    )}
                    {consumedSuggestions.has(meal.id) && (
                      <div className="w-full py-2 px-4 rounded-2xl bg-[#6BF178]/20 text-[#6BF178] text-center font-semibold">
                        ✓ Logged & consumed
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="modern-card glass-card-intense p-8 rounded-3xl hover-lift overflow-hidden text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#6BF178] to-[#E2F163] flex items-center justify-center shadow-[0_0_20px_rgba(107,241,120,0.4)]">
                <Sparkles className="w-10 h-10 text-[#04101B]" />
              </div>
              <h4 className="mb-2 text-[#6BF178] font-bold">Daily Goal Reached!</h4>
              <p className="text-[#DFF2D4]/80">
                You've met your calorie target for today. Great job!
              </p>
            </Card>
          )}
        </motion.div>

        {/* Nutrition Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-6"
        >
          <Card className="modern-card glass-card-intense p-6 rounded-3xl hover-lift overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] flex items-center justify-center flex-shrink-0 glow-effect-green pulse-modern">
                <TrendingUp className="w-6 h-6 text-[#04101B]" />
              </div>
              <div>
                <h4 className="mb-2 text-gradient-modern text-glow font-bold">Nutrition Tip</h4>
                <p className="text-[#DFF2D4]/80">
                  {remaining.protein > 40
                    ? "You still need more protein today. Try adding lean meats, fish, or a protein shake to your next meal."
                    : remaining.calories > 800
                    ? "Spread your remaining calories across multiple smaller meals for better energy throughout the day."
                    : "You're on track! Keep focusing on whole foods and staying hydrated."}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
