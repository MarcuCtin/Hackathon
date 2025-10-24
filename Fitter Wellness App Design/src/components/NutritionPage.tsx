import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { FitterLogo } from "./FitterLogo";
import { NutritionRecommender } from "./NutritionRecommender";
import { MealLogForm } from "./MealLogForm";
import { UserAvatar } from "./UserAvatar";
import { Utensils, Droplets, Zap, TrendingUp, Apple, Coffee, Clock, ChevronRight, Trash2, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

interface MealLog {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  items: string[];
}

interface SuggestedMeal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  items: string[];
  emoji: string;
}

interface NutritionPageProps {
  onProfileClick?: () => void;
}

export function NutritionPage({ onProfileClick }: NutritionPageProps) {
  const [loggedMeals, setLoggedMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch nutrition logs from backend
  useEffect(() => {
    const fetchNutritionLogs = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString(); // Full ISO datetime format
        const response = await api.getNutritionLogs(today);
        
        if (response.success && response.data) {
          // Transform backend data to frontend format
          const meals: MealLog[] = response.data.map((log: any) => ({
            id: log._id,
            name: log.mealType.charAt(0).toUpperCase() + log.mealType.slice(1),
            time: new Date(log.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            calories: log.total.calories,
            protein: log.total.protein,
            items: log.items.map((item: any) => item.name),
          }));
          setLoggedMeals(meals);
        }
      } catch (error) {
        console.error("Failed to fetch nutrition logs:", error);
        toast.error("Failed to load nutrition data");
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionLogs();
  }, []);

  // Daily targets
  const dailyTargets = {
    calories: 2200,
    protein: 120,
    water: 3.0,
    caffeine: 300,
  };

  // Calculate consumed nutrition
  const consumed = useMemo(() => {
    return loggedMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
      }),
      { calories: 0, protein: 0 }
    );
  }, [loggedMeals]);

  // Calculate remaining nutrition needed
  const remaining = {
    calories: dailyTargets.calories - consumed.calories,
    protein: dailyTargets.protein - consumed.protein,
  };

  // Generate dynamic meal suggestions based on remaining needs
  const suggestedMeals = useMemo((): SuggestedMeal[] => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    // Get the last logged meal time
    const lastMealTime = loggedMeals.length > 0
      ? loggedMeals[loggedMeals.length - 1].time
      : "00:00";
    
    const [lastHour, lastMinute] = lastMealTime.split(":").map(Number);
    const lastMealDate = new Date();
    lastMealDate.setHours(lastHour, lastMinute, 0, 0);

    // Calculate how many meals are left today
    const mealsLogged = loggedMeals.length;
    const mealsRemaining = Math.max(1, 4 - mealsLogged);
    
    // Distribute remaining calories and protein across remaining meals
    const caloriesPerMeal = Math.max(300, Math.round(remaining.calories / mealsRemaining));
    const proteinPerMeal = Math.max(15, Math.round(remaining.protein / mealsRemaining));

    const suggestions: SuggestedMeal[] = [];
    
    // Determine next meal times (3-4 hours apart)
    let nextMealHour = currentHour;
    let nextMealMinute = currentMinutes + 30; // Start 30 min from now
    
    if (nextMealMinute >= 60) {
      nextMealHour += 1;
      nextMealMinute -= 60;
    }

    // Lunch suggestion (if before 3 PM)
    if (currentHour < 15 && !loggedMeals.some(m => m.name.toLowerCase().includes("lunch"))) {
      const lunchCalories = Math.min(caloriesPerMeal, 700);
      const lunchProtein = Math.min(proteinPerMeal, 40);
      
      suggestions.push({
        id: "lunch",
        name: "Balanced Lunch",
        time: currentHour < 12 ? "12:30" : `${String(nextMealHour).padStart(2, "0")}:${String(nextMealMinute).padStart(2, "0")}`,
        calories: lunchCalories,
        protein: lunchProtein,
        items: [
          lunchProtein > 30 ? "Grilled chicken breast (150g)" : "Turkey wrap",
          remaining.calories > 1000 ? "Quinoa salad with vegetables" : "Mixed greens salad",
          "Olive oil dressing",
        ],
        emoji: "🥗",
      });
      nextMealHour += 3;
    }

    // Snack suggestion (if calories remaining)
    if (remaining.calories > 500 && currentHour < 17) {
      const snackTime = Math.max(currentHour + 2, 15);
      suggestions.push({
        id: "snack",
        name: "Energy Snack",
        time: `${String(snackTime).padStart(2, "0")}:30`,
        calories: Math.min(250, Math.round(remaining.calories * 0.15)),
        protein: Math.min(15, Math.round(remaining.protein * 0.15)),
        items: [
          remaining.protein > 40 ? "Protein shake" : "Greek yogurt",
          "Mixed nuts (30g)",
          remaining.calories > 1000 ? "Banana" : "Apple slices",
        ],
        emoji: "🍎",
      });
    }

    // Dinner suggestion
    if (currentHour < 20) {
      const dinnerCalories = Math.max(400, remaining.calories - (suggestions.length > 0 ? suggestions.reduce((sum, s) => sum + s.calories, 0) : 0));
      const dinnerProtein = Math.max(25, remaining.protein - (suggestions.length > 0 ? suggestions.reduce((sum, s) => sum + s.protein, 0) : 0));
      
      suggestions.push({
        id: "dinner",
        name: remaining.calories > 1000 ? "Hearty Dinner" : "Light Dinner",
        time: currentHour < 18 ? "19:00" : "20:00",
        calories: Math.min(dinnerCalories, 750),
        protein: Math.min(dinnerProtein, 45),
        items: [
          dinnerProtein > 35 ? "Grilled salmon fillet (180g)" : "Baked chicken (120g)",
          remaining.calories > 1000 ? "Sweet potato (200g)" : "Roasted vegetables",
          "Steamed broccoli",
        ],
        emoji: "🍽️",
      });
    }

    // Post-workout meal if high protein needed
    if (remaining.protein > 50 && currentHour < 18) {
      suggestions.push({
        id: "post-workout",
        name: "Post-Workout Meal",
        time: `${String(Math.min(currentHour + 1, 17)).padStart(2, "0")}:00`,
        calories: 350,
        protein: 35,
        items: [
          "Protein shake (30g whey)",
          "Banana",
          "Peanut butter (1 tbsp)",
        ],
        emoji: "💪",
      });
    }

    return suggestions;
  }, [loggedMeals, remaining]);

  // Get next meal
  const nextMeal = suggestedMeals[0];

  const handleAddMeal = async (meal: MealLog) => {
    try {
      // Map meal name to backend mealType
      const mealTypeMap: Record<string, "breakfast" | "lunch" | "dinner" | "snack"> = {
        "Breakfast": "breakfast",
        "Lunch": "lunch",
        "Dinner": "dinner",
        "Snack": "snack",
      };
      
      const mealType = mealTypeMap[meal.name] || "snack";
      
      // Calculate nutrition values
      const caloriesPerItem = Math.round(meal.calories / meal.items.length);
      const proteinPerItem = Math.round(meal.protein / meal.items.length);
      
      // Transform to backend format
      const backendMeal = {
        date: new Date().toISOString(),
        mealType,
        items: meal.items.map(item => ({
          name: item,
          calories: caloriesPerItem,
          protein: proteinPerItem,
          carbs: Math.round(caloriesPerItem * 0.4 / 4), // Approximate carbs
          fat: Math.round(caloriesPerItem * 0.2 / 9), // Approximate fat
        })),
      };
      
      // Save to backend
      const response = await api.logMeal(backendMeal);
      
      if (response.success) {
        toast.success("Meal logged successfully!");
        // Refresh nutrition logs
        const today = new Date().toISOString().split('T')[0];
        const logsResponse = await api.getNutritionLogs(today);
        
        if (logsResponse.success && logsResponse.data) {
          const meals: MealLog[] = logsResponse.data.map((log: any) => ({
            id: log._id,
            name: log.mealType.charAt(0).toUpperCase() + log.mealType.slice(1),
            time: new Date(log.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            calories: log.total.calories,
            protein: log.total.protein,
            items: log.items.map((item: any) => item.name),
          }));
          setLoggedMeals(meals);
        }
      }
    } catch (error) {
      console.error("Failed to log meal:", error);
      toast.error("Failed to log meal");
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      // TODO: Add delete endpoint to backend
      // For now, just remove from local state
      setLoggedMeals(loggedMeals.filter((m) => m.id !== id));
      toast.success("Meal removed");
    } catch (error) {
      console.error("Failed to delete meal:", error);
      toast.error("Failed to delete meal");
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
      value: "2.3",
      target: dailyTargets.water.toString(),
      unit: "L",
      gradient: "from-sky-400 to-cyan-400",
      bgGradient: "from-sky-50 to-cyan-50",
    },
    {
      icon: Coffee,
      label: "Caffeine",
      value: "180",
      target: dailyTargets.caffeine.toString(),
      unit: "mg",
      gradient: "from-amber-600 to-yellow-600",
      bgGradient: "from-amber-50 to-yellow-50",
    },
  ];

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

        {/* Meal Log Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <MealLogForm onAddMeal={handleAddMeal} />
        </motion.div>

        {/* Logged Meals */}
        {loggedMeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
                              <h4 className="mb-1 text-[#DFF2D4] font-semibold">{meal.name}</h4>
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
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <NutritionRecommender />
        </motion.div>

        {/* Suggested Meals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gradient-modern text-glow text-lg font-bold">Suggested Meals</h3>
            <Badge className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] border-0 font-semibold shadow-[0_0_15px_rgba(107,241,120,0.4)]">
              {remaining.calories > 0 ? `${remaining.calories} kcal remaining` : "Goal reached!"}
            </Badge>
          </div>

          {remaining.calories > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {suggestedMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <Card className="modern-card glass-card-intense p-6 rounded-3xl hover-lift overflow-hidden">
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

                    <div className="space-y-2">
                      {meal.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-[#DFF2D4]/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
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
          transition={{ delay: 1 }}
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
