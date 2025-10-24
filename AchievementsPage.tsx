import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { FitterLogo } from "./FitterLogo";
import { UserAvatar } from "./UserAvatar";
import { Award, TrendingUp, Flame, Target, Star, Trophy } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

interface Achievement {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  icon?: string;
  progress?: number;
  target?: number;
}

export function AchievementsPage({ onProfileClick }: { onProfileClick?: () => void }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const response = await api.getAchievements();
        
        if (response.success && response.data) {
          setAchievements(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
        toast.error("Failed to load achievements");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "nutrition": return "🍎";
      case "exercise": return "💪";
      case "sleep": return "😴";
      case "wellness": return "🌟";
      case "streak": return "🔥";
      case "milestone": return "🏆";
      default: return "⭐";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "nutrition": return "from-[#6BF178] to-[#E2F163]";
      case "exercise": return "from-[#FF6B35] to-[#F7B801]";
      case "sleep": return "from-[#A855F7] to-[#6BF178]";
      case "wellness": return "from-[#00F5FF] to-[#6BF178]";
      case "streak": return "from-[#FF006E] to-[#FF6B35]";
      case "milestone": return "from-[#E2F163] to-[#6BF178]";
      default: return "from-[#6BF178] to-[#DFF2D4]";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-modern particles-bg glowing-bg relative pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#04101B]/90 border-b-2 border-[#6BF178]/40 shadow-lg shadow-[#6BF178]/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <FitterLogo size={36} />
            <div className="flex items-center gap-4">
              <button onClick={onProfileClick} className="focus:outline-none">
                <UserAvatar size={40} userName="Alex Thompson" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 bg-gradient-to-r from-[#6BF178] to-[#E2F163] bg-clip-text text-transparent flex items-center gap-2 text-4xl font-bold">
            <Award className="w-8 h-8 text-[#6BF178]" />
            Achievements
          </h1>
          <p className="text-[#DFF2D4]">Your wellness milestones and accomplishments</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 animate-spin rounded-full border-4 border-[#6BF178] border-r-transparent"></div>
          </div>
        ) : achievements.length === 0 ? (
          <Card className="modern-card glass-card-intense p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-[#6BF178]" />
            <h3 className="text-[#DFF2D4] text-xl font-semibold mb-2">No achievements yet</h3>
            <p className="text-[#DFF2D4]/70">Complete tasks and track your wellness to earn achievements!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="modern-card glass-card-intense p-6 hover-lift border-2 border-[#6BF178]/30 hover:border-[#6BF178]/60">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getCategoryColor(achievement.category)} flex items-center justify-center text-3xl flex-shrink-0 shadow-lg`}>
                      {achievement.icon || getCategoryIcon(achievement.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#DFF2D4] font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-[#DFF2D4]/70 text-sm mb-3">{achievement.description}</p>
                      <Badge className={`bg-gradient-to-r ${getCategoryColor(achievement.category)} text-[#04101B] border-0`}>
                        {achievement.category}
                      </Badge>
                      {achievement.progress !== undefined && achievement.target && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-[#DFF2D4]/70 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.target}</span>
                          </div>
                          <div className="h-2 bg-[#DFF2D4]/20 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${getCategoryColor(achievement.category)}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

