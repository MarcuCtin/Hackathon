import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Plus, X, Clock, Utensils } from "lucide-react";

interface MealLog {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  items: string[];
}

interface MealLogFormProps {
  onAddMeal: (meal: MealLog) => void;
}

export function MealLogForm({ onAddMeal }: MealLogFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mealName, setMealName] = useState("");
  const [mealTime, setMealTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [currentItem, setCurrentItem] = useState("");
  const [items, setItems] = useState<string[]>([]);

  const handleAddItem = () => {
    if (currentItem.trim()) {
      setItems([...items, currentItem.trim()]);
      setCurrentItem("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mealName || !calories || items.length === 0) return;

    const meal: MealLog = {
      id: Date.now().toString(),
      name: mealName,
      time: mealTime,
      calories: parseInt(calories),
      protein: protein ? parseInt(protein) : 0,
      items,
    };

    onAddMeal(meal);

    // Reset form
    setMealName("");
    setCalories("");
    setProtein("");
    setItems([]);
    setIsOpen(false);
  };

  const quickMeals = [
    { name: "Breakfast", emoji: "🍳", calories: "400-500" },
    { name: "Lunch", emoji: "🥗", calories: "500-700" },
    { name: "Snack", emoji: "🍎", calories: "150-250" },
    { name: "Dinner", emoji: "🍽️", calories: "500-650" },
  ];

  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full rounded-3xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 shadow-lg h-14"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log a Meal
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6 rounded-3xl border-white/20 bg-white/90 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-slate-900">Log Your Meal</h4>
              <p className="text-slate-500">What did you eat?</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick meal selection */}
        <div className="mb-6">
          <Label className="mb-2 block text-slate-700">Quick Select</Label>
          <div className="grid grid-cols-4 gap-2">
            {quickMeals.map((meal) => (
              <button
                key={meal.name}
                onClick={() => setMealName(meal.name)}
                className={`p-3 rounded-2xl transition-all ${
                  mealName === meal.name
                    ? "bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300"
                    : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="text-2xl mb-1">{meal.emoji}</div>
                <div className="text-xs text-slate-700">{meal.name}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meal name and time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mealName" className="mb-2 block text-slate-700">
                Meal Name
              </Label>
              <Input
                id="mealName"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="e.g. Lunch"
                className="rounded-2xl border-slate-200 bg-white/50"
                required
              />
            </div>
            <div>
              <Label htmlFor="mealTime" className="mb-2 block text-slate-700">
                <Clock className="w-3 h-3 inline mr-1" />
                Time
              </Label>
              <Input
                id="mealTime"
                type="time"
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                className="rounded-2xl border-slate-200 bg-white/50"
                required
              />
            </div>
          </div>

          {/* Nutrition info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calories" className="mb-2 block text-slate-700">
                Calories (kcal)
              </Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="450"
                className="rounded-2xl border-slate-200 bg-white/50"
                required
              />
            </div>
            <div>
              <Label htmlFor="protein" className="mb-2 block text-slate-700">
                Protein (g) - Optional
              </Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="25"
                className="rounded-2xl border-slate-200 bg-white/50"
              />
            </div>
          </div>

          {/* Food items */}
          <div>
            <Label htmlFor="foodItem" className="mb-2 block text-slate-700">
              Food Items
            </Label>
            <div className="flex gap-2">
              <Input
                id="foodItem"
                value={currentItem}
                onChange={(e) => setCurrentItem(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem())}
                placeholder="e.g. Grilled chicken"
                className="rounded-2xl border-slate-200 bg-white/50"
              />
              <Button
                type="button"
                onClick={handleAddItem}
                variant="outline"
                className="rounded-2xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Items list */}
          {items.length > 0 && (
            <div className="space-y-2">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
                  <span className="flex-1 text-slate-700">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Submit button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!mealName || !calories || items.length === 0}
              className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50"
            >
              Add Meal
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
