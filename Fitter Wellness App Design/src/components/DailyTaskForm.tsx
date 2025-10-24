import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Plus, X, Clock } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

interface DailyTaskFormProps {
  onTaskAdded?: () => void;
}

export function DailyTaskForm({ onTaskAdded }: DailyTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [category, setCategory] = useState<"wellness" | "nutrition" | "exercise" | "supplements" | "custom">("wellness");

  const categories = [
    { value: "wellness", label: "Wellness", icon: "🌟" },
    { value: "nutrition", label: "Nutrition", icon: "🍎" },
    { value: "exercise", label: "Exercise", icon: "💪" },
    { value: "supplements", label: "Supplements", icon: "💊" },
    { value: "custom", label: "Custom", icon: "📝" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    try {
      await api.createDailyTask({
        title: title.trim(),
        scheduledTime,
        date: new Date().toISOString(),
        category,
      });

      toast.success("Task created successfully!");
      
      // Reset form
      setTitle("");
      setScheduledTime("09:00");
      setCategory("wellness");
      setIsOpen(false);
      
      // Callback to refresh tasks
      if (onTaskAdded) {
        onTaskAdded();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] hover:shadow-lg hover:shadow-[#6BF178]/50 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Task
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="modern-card glass-card-intense p-6 border-2 border-[#6BF178]/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#6BF178] font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Create New Task
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-[#DFF2D4] hover:text-[#6BF178]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-[#DFF2D4] mb-2 block font-semibold">Task Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning meditation"
                className="bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178]"
              />
            </div>

            <div>
              <Label className="text-[#DFF2D4] mb-2 block font-semibold">Scheduled Time</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] focus:border-[#6BF178]"
              />
            </div>

            <div>
              <Label className="text-[#DFF2D4] mb-2 block font-semibold">Category</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    type="button"
                    variant={category === cat.value ? "default" : "outline"}
                    onClick={() => setCategory(cat.value as any)}
                    className={`${
                      category === cat.value
                        ? "bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] border-0"
                        : "bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] hover:border-[#6BF178]"
                    }`}
                  >
                    <span className="mr-1">{cat.icon}</span>
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-[#0a1f33]/80 border-2 border-[#FF006E]/30 text-[#DFF2D4] hover:border-[#FF006E] hover:bg-[#FF006E]/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] hover:shadow-lg hover:shadow-[#6BF178]/50 font-semibold"
              >
                Create Task
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

