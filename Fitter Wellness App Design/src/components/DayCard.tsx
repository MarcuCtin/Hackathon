import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { 
  Droplet, 
  Moon, 
  Dumbbell, 
  Utensils, 
  Activity, 
  TrendingUp,
  Calendar,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

interface DayCardProps {
  date: string;
  wellness: {
    score: number;
    energyLevel: number;
    hydration: number;
    sleepHours: number;
  };
  movement: {
    workoutCalories: number;
    steps: number;
    activeMinutes: number;
  };
  nutrition: {
    totalCalories: number;
    totalProtein: number;
    mealCount: number;
  };
  onViewDetails: (date: string) => void;
}

export function DayCard({ 
  date, 
  wellness, 
  movement, 
  nutrition, 
  onViewDetails 
}: DayCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const parsedDate = parseISO(date);
  const dayName = format(parsedDate, 'EEEE');
  const dayNumber = format(parsedDate, 'd');
  const month = format(parsedDate, 'MMM');
  
  const getWellnessIcon = (score: number) => {
    if (score >= 80) return <Sparkles className="w-5 h-5 text-[#04101B]" />;
    if (score >= 60) return <TrendingUp className="w-5 h-5 text-[#04101B]" />;
    return <Moon className="w-5 h-5 text-[#04101B]" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`modern-card glass-card-intense cursor-pointer transition-all duration-200 hover-lift ${
          isHovered ? 'border-[#6BF178]/60' : 'border-[#6BF178]/30'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onViewDetails(date)}
      >
        <CardContent className="p-6">
          {/* Header with date and wellness score */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#DFF2D4]">{dayNumber}</div>
                <div className="text-xs text-[#DFF2D4]/70 uppercase">{month}</div>
              </div>
              <div>
                <div className="font-semibold text-[#DFF2D4]">{dayName}</div>
                <div className="text-sm text-[#DFF2D4]/70">
                  {format(parsedDate, 'MMM d, yyyy')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`rounded-full border-0 shadow-[0_0_15px_rgba(107,241,120,0.4)] bg-gradient-to-r ${
                wellness.score >= 80 ? 'from-[#6BF178] to-[#E2F163]' :
                wellness.score >= 60 ? 'from-[#E2F163] to-[#6BF178]' :
                'from-[#0a1f33] to-[#0a1f33]/80'
              }`}>
                <div className="flex items-center gap-1 text-[#04101B]">
                  {getWellnessIcon(wellness.score)}
                  <span className="font-semibold">{wellness.score}%</span>
                </div>
              </Badge>
            </div>
          </div>

          {/* Wellness Overview */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0a1f33]/50 border border-[#6BF178]/20">
              <Droplet className="w-4 h-4 text-[#6BF178]" />
              <span className="text-sm text-[#DFF2D4]">{wellness.hydration} glasses</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0a1f33]/50 border border-[#A855F7]/20">
              <Moon className="w-4 h-4 text-[#A855F7]" />
              <span className="text-sm text-[#DFF2D4]">{wellness.sleepHours}h sleep</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0a1f33]/50 border border-[#E2F163]/20">
              <Dumbbell className="w-4 h-4 text-[#E2F163]" />
              <span className="text-sm text-[#DFF2D4]">{movement.workoutCalories} kcal</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0a1f33]/50 border border-[#FF006E]/20">
              <Utensils className="w-4 h-4 text-[#FF006E]" />
              <span className="text-sm text-[#DFF2D4]">{nutrition.mealCount} meals</span>
            </div>
          </div>

          {/* Energy Level Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#DFF2D4]">Energy Level</span>
              <span className="text-sm text-[#DFF2D4]/70">{wellness.energyLevel}%</span>
            </div>
            <div className="relative h-3 bg-[#DFF2D4]/20 rounded-full border border-[#6BF178]/30">
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${wellness.energyLevel}%`,
                  background: 'linear-gradient(90deg, #6BF178, #E2F163)',
                  boxShadow: '0 0 15px rgba(107, 241, 120, 0.6)'
                }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between text-xs text-[#DFF2D4]/70 mb-3">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#6BF178]" />
              <span>{movement.steps.toLocaleString()} steps</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#E2F163]" />
              <span>{nutrition.totalCalories} cal</span>
            </div>
          </div>

          {/* View Details Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-2 border-[#6BF178]/30 text-[#DFF2D4] hover:border-[#6BF178] hover:bg-[#6BF178]/10"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}


