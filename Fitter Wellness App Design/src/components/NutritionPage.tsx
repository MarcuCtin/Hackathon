// @ts-nocheck
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { FitterLogo } from "./FitterLogo";
import { NutritionRecommender } from "./NutritionRecommender";
import { MealLogForm } from "./MealLogForm";
import { UserAvatar } from "./UserAvatar";
import { Utensils, Droplets, Zap, TrendingUp, Apple, Coffee, Clock, ChevronRight, Trash2 } from "lucide-react";
import { useActivityData } from "../context/ActivityContext";

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
  const [loggedMeals, setLoggedMeals] = useState<MealLog[]>([
    {
      id: "1",
      name: "Breakfast",
      time: "08:30",
      calories: 450,
      protein: 28,
      items: ["Greek yogurt with berries", "Whole grain toast", "Scrambled eggs"],
    },
  ]);
  const { nutritionLogs, hydrationToday, mealCountToday } = useActivityData();

  const aiMeals = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return (nutritionLogs || [])
      .filter((meal) => new Date(meal.date).getTime() >= start.getTime())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [nutritionLogs]);

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

  const aiTotals = useMemo(() => {
    return aiMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.total?.calories ?? 0),
        protein: acc.protein + (meal.total?.protein ?? 0),
      }),
      { calories: 0, protein: 0 }
    );
  }, [aiMeals]);

  const combinedConsumed = {
    calories: consumed.calories + aiTotals.calories,
    protein: consumed.protein + aiTotals.protein,
  };

  // Calculate remaining nutrition needed
  const remaining = {
    calories: Math.max(0, dailyTargets.calories - combinedConsumed.calories),
    protein: Math.max(0, dailyTargets.protein - combinedConsumed.protein),
  };

  const hydrationLiters = (hydrationToday * 0.25).toFixed(1);

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

  const handleAddMeal = (meal: MealLog) => {
    setLoggedMeals([...loggedMeals, meal]);
  };

  const handleDeleteMeal = (id: string) => {
    setLoggedMeals(loggedMeals.filter((m) => m.id !== id));
  };

  const nutritionStats = [
    {
      icon: Apple,
      label: "Calories",
      value: combinedConsumed.calories,
      target: dailyTargets.calories,
      unit: "kcal",
      gradient: "from-rose-400 to-pink-400",
      bgGradient: "from-rose-50 to-pink-50",
    },
    {
      icon: Zap,
      label: "Protein",
      value: combinedConsumed.protein,
      target: dailyTargets.protein,
      unit: "g",
      gradient: "from-amber-400 to-orange-400",
      bgGradient: "from-amber-50 to-orange-50",
    },
    {
      icon: Droplets,
      label: "Water",
      value: parseFloat(hydrationLiters),
      target: dailyTargets.water,
      unit: "L",
      gradient: "from-sky-400 to-cyan-400",
      bgGradient: "from-sky-50 to-cyan-50",
    },
    {
      icon: Coffee,
      label: "Caffeine",
      value: 180,
      target: dailyTargets.caffeine,
      unit: "mg",
      gradient: "from-amber-600 to-yellow-600",
      bgGradient: "from-amber-50 to-yellow-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 pb-24">
      {/* Header with Next Meal */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <FitterLogo size={36} />
              <div>
                <h3 className="text-slate-900">Nutrition</h3>
                <p className="text-slate-500">Smart meal & supplement guidance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-slate-700 border-0">
                <Utensils className="w-3 h-3 mr-1" />
                Today
              </Badge>
              <Badge className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0">
                🥗 {mealCountToday} AI meals
              </Badge>
              <Badge className="rounded-full bg-gradient-to-r from-sky-100 to-blue-100 text-blue-700 border-0">
                💧 {hydrationLiters} L logged
              </Badge>
              <button onClick={onProfileClick} className="focus:outline-none">
                <UserAvatar size={36} userName="Alex Thompson" />
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
              <Card className="p-4 rounded-2xl border-white/20 bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{nextMeal.emoji}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Next: {nextMeal.name}</span>
                        <Badge className="rounded-full bg-white/20 text-white border-0">
                          <Clock className="w-3 h-3 mr-1" />
                          {nextMeal.time}
                        </Badge>
                      </div>
                      <p className="text-white/80 text-sm">
                        {nextMeal.calories} kcal · {nextMeal.protein}g protein
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/60" />
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Nutrition Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="mb-4">Today's Nutrition</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nutritionStats.map((stat, index) => {
              const Icon = stat.icon;
              const percentage = (stat.target === 0 ? 0 : (stat.value / stat.target) * 100);
              const displayValue = stat.label === "Water"
                ? stat.value.toFixed(1)
                : Math.round(stat.value).toString();
              const displayTarget = stat.label === "Water"
                ? stat.target.toFixed(1)
                : stat.target.toString();

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-5 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
                    <div
                      className={`w-12 h-12 mb-3 rounded-2xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-slate-600 mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className={`text-2xl bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                        {displayValue}
                      </span>
                      <span className="text-slate-500">/ {displayTarget}</span>
                      <span className="text-slate-400">{stat.unit}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
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

        {aiMeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-6"
          >
            <h3 className="mb-4">AI Logged Meals</h3>
            <div className="space-y-3">
              {aiMeals.map((meal) => (
                <Card
                  key={meal._id}
                  className="p-5 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="mb-1 capitalize">{meal.mealType}</h4>
                      <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(meal.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <Badge className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-slate-700 border-0">
                          {meal.total?.calories ?? 0} kcal
                        </Badge>
                        {meal.total?.protein ? (
                          <Badge className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-slate-700 border-0">
                            {meal.total.protein}g protein
                          </Badge>
                        ) : null}
                      </div>
                      <ul className="text-slate-500 text-sm list-disc pl-5 space-y-1">
                        {meal.items?.map((item, index) => (
                          <li key={`${meal._id}-${index}`}>
                            {item.name}
                            {item.calories ? ` · ${item.calories} kcal` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

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
            <h3 className="mb-4">Meals Eaten Today</h3>
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
                    <Card className="p-5 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow group">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-2xl flex-shrink-0">
                          {meal.name.toLowerCase().includes("breakfast") ? "🍳" :
                           meal.name.toLowerCase().includes("lunch") ? "🥗" :
                           meal.name.toLowerCase().includes("dinner") ? "🍽️" : "🍴"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="mb-1">{meal.name}</h4>
                              <div className="flex items-center gap-3 text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {meal.time}
                                </span>
                                <Badge className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-slate-700 border-0">
                                  {meal.calories} kcal
                                </Badge>
                                {meal.protein > 0 && (
                                  <Badge className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-slate-700 border-0">
                                    {meal.protein}g protein
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                            </Button>
                          </div>

                          <div className="space-y-1">
                            {meal.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
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
            <h3>Suggested Meals</h3>
            <Badge className="rounded-full bg-gradient-to-r from-sky-100 to-emerald-100 text-slate-700 border-0">
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
                  <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-3xl">
                        {meal.emoji}
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1">{meal.name}</h4>
                        <p className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meal.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-slate-700 border-0 mb-1">
                          {meal.calories} kcal
                        </Badge>
                        <div className="text-sm text-slate-500">{meal.protein}g protein</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {meal.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 rounded-3xl border-white/20 bg-gradient-to-br from-emerald-50 to-teal-50 backdrop-blur-xl text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h4 className="mb-2">Daily Goal Reached!</h4>
              <p className="text-slate-600">
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
          <Card className="p-6 rounded-3xl border-white/20 bg-gradient-to-br from-sky-50 to-cyan-50 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="mb-2">Nutrition Tip</h4>
                <p className="text-slate-600">
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
