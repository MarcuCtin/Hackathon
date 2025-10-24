import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Droplet, Moon, Heart, Apple, Zap, BedDouble, X, Check, Loader2, Dumbbell, Utensils, Activity } from "lucide-react";
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
          let icon = <Activity className="w-6 h-6" />;
          let gradientFrom = "#6BF178";
          let gradientTo = "#E2F163";
          let priority: "high" | "medium" | "low" = "medium";

          const lowerText = text.toLowerCase();
          
          if (lowerText.includes("sleep") || lowerText.includes("bed") || lowerText.includes("rest")) {
            category = "Sleep";
            emoji = "😴";
            icon = <Moon className="w-6 h-6" />;
            gradientFrom = "#A855F7";
            gradientTo = "#6BF178";
            priority = "high";
          } else if (lowerText.includes("water") || lowerText.includes("hydrat")) {
            category = "Hydration";
            emoji = "💧";
            icon = <Droplet className="w-6 h-6" />;
            gradientFrom = "#6BF178";
            gradientTo = "#DFF2D4";
            priority = "high";
          } else if (lowerText.includes("workout") || lowerText.includes("exercise") || lowerText.includes("recovery")) {
            category = "Recovery";
            emoji = "🏋️‍♂️";
            icon = <Dumbbell className="w-6 h-6" />;
            gradientFrom = "#E2F163";
            gradientTo = "#6BF178";
            priority = "medium";
          } else if (lowerText.includes("protein") || lowerText.includes("nutrition") || lowerText.includes("meal") || lowerText.includes("eat")) {
            category = "Nutrition";
            emoji = "🍗";
            icon = <Utensils className="w-6 h-6" />;
            gradientFrom = "#FF006E";
            gradientTo = "#E2F163";
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
          <Loader2 className="w-8 h-8 animate-spin text-[#6BF178]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[#6BF178]">AI Daily Suggestions</h3>
          <p className="text-[#DFF2D4]/70">Your AI companion's recommendations</p>
        </div>
        <Badge className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] border-0 font-semibold shadow-[0_0_10px_rgba(107,241,120,0.4)]">
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
              className="relative overflow-hidden border-[#6BF178]/30 bg-[#0a1f33]/60 backdrop-blur-xl shadow-[0_0_15px_rgba(107,241,120,0.2)] hover:shadow-[0_0_25px_rgba(107,241,120,0.4)] transition-all group"
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
                  {/* Animated SVG icon */}
                  <motion.div
                    className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border-2 backdrop-blur-md"
                    style={{
                      background: `linear-gradient(135deg, ${rec.gradientFrom}40, ${rec.gradientTo}40)`,
                      borderColor: rec.gradientFrom,
                      boxShadow: `0 0 25px ${rec.gradientFrom}60, inset 0 0 15px ${rec.gradientFrom}30`,
                    }}
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}>
                      {rec.icon}
                    </div>
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    {/* Category badge */}
                    <Badge
                      className="mb-2 rounded-full border-2 font-extrabold backdrop-blur-md px-3 py-1.5 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${rec.gradientFrom}30, ${rec.gradientTo}30)`,
                        borderColor: rec.gradientFrom,
                        borderWidth: '2px',
                        boxShadow: `0 0 20px ${rec.gradientFrom}50, inset 0 0 10px ${rec.gradientFrom}20`,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.3)',
                      }}
                    >
                      <motion.div
                        className="mr-1.5 text-white"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}
                      >
                        {rec.icon}
                      </motion.div>
                      {rec.category}
                    </Badge>

                    <h4 className="mb-1 text-[#DFF2D4] font-semibold">{rec.title}</h4>
                    <p className="text-[#DFF2D4]/80">{rec.description}</p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleComplete(rec.id)}
                        className="rounded-full text-white border-2 font-bold px-5 py-2.5 hover:scale-110 transition-all duration-300 relative overflow-hidden group"
                        style={{
                          background: `linear-gradient(135deg, ${rec.gradientFrom}, ${rec.gradientTo})`,
                          borderColor: rec.gradientFrom,
                          boxShadow: `0 0 30px ${rec.gradientFrom}80, 0 6px 12px rgba(0,0,0,0.4), inset 0 0 20px ${rec.gradientFrom}40`,
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        }}
                      >
                        {/* Glow effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <Check className="w-4 h-4 mr-1.5 relative z-10" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.9)) drop-shadow(0 0 8px rgba(255,255,255,0.8))' }} />
                        <span className="relative z-10" style={{ textShadow: '0 3px 6px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.5), 0 0 24px rgba(255,255,255,0.3)' }}>I'll do it</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismiss(rec.id)}
                        className="rounded-full border-2 text-[#DFF2D4] hover:bg-[#FF006E]/20 hover:border-[#FF006E]/50 px-4 py-2 transition-all backdrop-blur-sm"
                        style={{
                          borderColor: 'rgba(107, 241, 120, 0.3)',
                          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                        }}
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
                    <div className="w-3 h-3 rounded-full bg-[#E2F163] shadow-lg shadow-[#E2F163]/50" />
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
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#6BF178] to-[#E2F163] flex items-center justify-center shadow-[0_0_20px_rgba(107,241,120,0.4)]">
            <Zap className="w-10 h-10 text-[#04101B]" />
          </div>
          <h4 className="mb-2 text-[#6BF178] font-bold">All caught up!</h4>
          <p className="text-[#DFF2D4]/70">No new suggestions right now. Great job!</p>
        </motion.div>
      )}
    </div>
  );
}
