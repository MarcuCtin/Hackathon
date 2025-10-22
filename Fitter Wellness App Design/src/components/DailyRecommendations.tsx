import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Droplet, Moon, Heart, Apple, Zap, BedDouble, X, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";

interface Recommendation {
  id: number;
  title: string;
  description: string;
  emoji: string;
  icon: React.ReactNode;
  category: string;
  categoryColor: string;
  gradientFrom: string;
  gradientTo: string;
  priority: "high" | "medium" | "low";
}

export function DailyRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recommendations from backend
  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const { data } = await api.getSuggestions();
        
        // Transform backend suggestions into recommendation cards
        const transformedRecs: Recommendation[] = data.map((text: string, index: number) => {
          // Infer category and styling based on keywords
          let category = "Wellness";
          let emoji = "✨";
          let icon = <Zap className="w-5 h-5" />;
          let gradientFrom = "#60a5fa";
          let gradientTo = "#3b82f6";
          let priority: "high" | "medium" | "low" = "medium";

          const lowerText = text.toLowerCase();
          
          if (lowerText.includes("sleep") || lowerText.includes("bed") || lowerText.includes("rest")) {
            category = "Sleep";
            emoji = "😴";
            icon = <Moon className="w-5 h-5" />;
            gradientFrom = "#818cf8";
            gradientTo = "#6366f1";
            priority = "high";
          } else if (lowerText.includes("water") || lowerText.includes("hydrat")) {
            category = "Hydration";
            emoji = "💧";
            icon = <Droplet className="w-5 h-5" />;
            gradientFrom = "#60a5fa";
            gradientTo = "#3b82f6";
            priority = "high";
          } else if (lowerText.includes("workout") || lowerText.includes("exercise") || lowerText.includes("recovery")) {
            category = "Recovery";
            emoji = "🏋️‍♂️";
            icon = <Heart className="w-5 h-5" />;
            gradientFrom = "#fb7185";
            gradientTo = "#f43f5e";
            priority = "medium";
          } else if (lowerText.includes("protein") || lowerText.includes("nutrition") || lowerText.includes("meal") || lowerText.includes("eat")) {
            category = "Nutrition";
            emoji = "🍗";
            icon = <Apple className="w-5 h-5" />;
            gradientFrom = "#6ee7b7";
            gradientTo = "#10b981";
            priority = "medium";
          }

          return {
            id: index + 1,
            title: text.split('.')[0], // First sentence as title
            description: text.includes('.') ? text.split('.').slice(1).join('.').trim() : "AI-powered recommendation",
            emoji,
            icon,
            category,
            categoryColor: "bg-blue-500",
            gradientFrom,
            gradientTo,
            priority,
          };
        });

        setRecommendations(transformedRecs);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        toast.error("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();
  }, []);

  const handleDismiss = (id: number) => {
    setDismissedIds([...dismissedIds, id]);
  };

  const handleComplete = (id: number) => {
    setDismissedIds([...dismissedIds, id]);
  };

  const visibleRecommendations = recommendations.filter(
    (rec) => !dismissedIds.includes(rec.id)
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3>Daily Suggestions</h3>
          <p className="text-slate-500">AI-powered actions for today</p>
        </div>
        <Badge className="rounded-full bg-gradient-to-r from-sky-100 to-emerald-100 text-slate-700 border-0">
          {visibleRecommendations.length} active
        </Badge>
      </div>

      <div className="space-y-3">
        {visibleRecommendations.slice(0, 3).map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="relative overflow-hidden border-white/20 bg-white/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all group"
              style={{
                borderRadius: "24px",
              }}
            >
              {/* Animated gradient background */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${rec.gradientFrom}15, ${rec.gradientTo}15)`,
                }}
              />

              <div className="relative p-5">
                <div className="flex items-start gap-4">
                  {/* Animated emoji icon */}
                  <motion.div
                    className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${rec.gradientFrom}20, ${rec.gradientTo}20)`,
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <span className="text-3xl">{rec.emoji}</span>
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    {/* Category badge */}
                    <Badge
                      className="mb-2 rounded-full text-white border-0"
                      style={{
                        background: `linear-gradient(135deg, ${rec.gradientFrom}, ${rec.gradientTo})`,
                      }}
                    >
                      <motion.div
                        className="mr-1"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {rec.icon}
                      </motion.div>
                      {rec.category}
                    </Badge>

                    <h4 className="mb-1 text-slate-900">{rec.title}</h4>
                    <p className="text-slate-600">{rec.description}</p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleComplete(rec.id)}
                        className="rounded-full text-white border-0"
                        style={{
                          background: `linear-gradient(135deg, ${rec.gradientFrom}, ${rec.gradientTo})`,
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        I'll do it
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismiss(rec.id)}
                        className="rounded-full border-slate-200"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Priority indicator */}
                {rec.priority === "high" && (
                  <motion.div
                    className="absolute top-3 right-3"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {visibleRecommendations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center">
            <Zap className="w-10 h-10 text-emerald-600" />
          </div>
          <h4 className="mb-2">All caught up! 🎉</h4>
          <p className="text-slate-600">No new suggestions right now. Great job!</p>
        </motion.div>
      )}
    </div>
  );
}
