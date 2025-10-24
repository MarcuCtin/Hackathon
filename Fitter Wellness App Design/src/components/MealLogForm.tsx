import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Plus, X, Clock, Utensils, Coffee, Apple, Sandwich, Moon } from "lucide-react";

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
    { name: "Breakfast", icon: Coffee, calories: "400-500" },
    { name: "Lunch", icon: Sandwich, calories: "500-700" },
    { name: "Snack", icon: Apple, calories: "150-250" },
    { name: "Dinner", icon: Moon, calories: "500-650" },
  ];

  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full rounded-3xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] hover:from-[#6BF178] hover:to-[#E2F163] shadow-[0_0_20px_rgba(107,241,120,0.4)] h-14 text-[#04101B] font-bold"
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
      <Card className="modern-card glass-card-intense p-6 rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] flex items-center justify-center glow-effect-green">
              <Utensils className="w-6 h-6 text-[#04101B]" />
            </div>
            <div>
              <h4 className="text-[#DFF2D4] font-bold">Log Your Meal</h4>
              <p className="text-[#DFF2D4]/70">What did you eat?</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="rounded-full hover:bg-[#FF006E]/20"
          >
            <X className="w-5 h-5 text-[#DFF2D4]" />
          </Button>
        </div>

        {/* Quick meal selection */}
        <div className="mb-6">
          <Label className="mb-2 block text-[#DFF2D4] font-semibold">Quick Select</Label>
          <div className="grid grid-cols-4 gap-2">
            {quickMeals.map((meal) => {
              const Icon = meal.icon;
              return (
                <button
                  key={meal.name}
                  onClick={() => setMealName(meal.name)}
                  className={`p-3 rounded-2xl transition-all border-2 ${
                    mealName === meal.name
                      ? "bg-gradient-to-br from-[#6BF178]/40 to-[#E2F163]/40 border-[#6BF178] shadow-[0_0_15px_rgba(107,241,120,0.4)]"
                      : "bg-[#0a1f33]/50 border-[#6BF178]/20 hover:bg-[#0a1f33]/80 hover:border-[#6BF178]/40"
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-1 ${mealName === meal.name ? 'text-[#6BF178]' : 'text-[#DFF2D4]/60'}`} />
                  <div className={`text-xs ${mealName === meal.name ? 'text-[#DFF2D4] font-semibold' : 'text-[#DFF2D4]/70'}`}>{meal.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meal name and time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mealName" className="mb-2 block text-[#DFF2D4] font-semibold">
                Meal Name
              </Label>
              <Input
                id="mealName"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="e.g. Lunch"
                className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50"
                required
              />
            </div>
            <div>
              <Label htmlFor="mealTime" className="mb-2 block text-[#DFF2D4] font-semibold">
                <Clock className="w-3 h-3 inline mr-1" />
                Time
              </Label>
              <Input
                id="mealTime"
                type="time"
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4]"
                required
              />
            </div>
          </div>

          {/* Nutrition info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calories" className="mb-2 block text-[#DFF2D4] font-semibold">
                Calories (kcal)
              </Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="450"
                className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50"
                required
              />
            </div>
            <div>
              <Label htmlFor="protein" className="mb-2 block text-[#DFF2D4] font-semibold">
                Protein (g) - Optional
              </Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="25"
                className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50"
              />
            </div>
          </div>

          {/* Food items */}
          <div>
            <Label htmlFor="foodItem" className="mb-2 block text-[#DFF2D4] font-semibold">
              Food Items
            </Label>
            <div className="flex gap-2">
              <Input
                id="foodItem"
                value={currentItem}
                onChange={(e) => setCurrentItem(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem())}
                placeholder="e.g. Grilled chicken"
                className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50"
              />
              <Button
                type="button"
                onClick={handleAddItem}
                variant="outline"
                className="rounded-2xl border-[#6BF178]/30 hover:bg-[#6BF178]/20"
              >
                <Plus className="w-4 h-4 text-[#6BF178]" />
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
                  className="flex items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-[#6BF178]/20 to-[#E2F163]/20 border border-[#6BF178]/30"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163]" />
                  <span className="flex-1 text-[#DFF2D4]">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-[#DFF2D4]/40 hover:text-[#FF006E] transition-colors"
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
              className="flex-1 rounded-2xl border-[#6BF178]/30 text-[#DFF2D4] hover:bg-[#FF006E]/20 hover:border-[#FF006E]/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!mealName || !calories || items.length === 0}
              className="flex-1 rounded-2xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] hover:from-[#6BF178] hover:to-[#E2F163] disabled:opacity-50 text-[#04101B] font-bold shadow-[0_0_20px_rgba(107,241,120,0.4)]"
            >
              Add Meal
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
