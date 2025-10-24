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
  ChevronRight
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
  
  // Calculate wellness color based on score
  const getWellnessColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getWellnessEmoji = (score: number) => {
    if (score >= 80) return "🌟";
    if (score >= 60) return "😊";
    return "😴";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isHovered ? 'shadow-lg border-blue-200' : 'shadow-sm border-gray-200'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onViewDetails(date)}
      >
        <CardContent className="p-4">
          {/* Header with date and wellness score */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{dayNumber}</div>
                <div className="text-xs text-slate-500 uppercase">{month}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-800">{dayName}</div>
                <div className="text-sm text-slate-500">
                  {format(parsedDate, 'MMM d, yyyy')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${getWellnessColor(wellness.score)} border-0`}>
                {getWellnessEmoji(wellness.score)} {wellness.score}%
              </Badge>
            </div>
          </div>

          {/* Wellness Overview */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-slate-600">{wellness.hydration} glasses</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-slate-600">{wellness.sleepHours}h sleep</span>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-green-500" />
              <span className="text-sm text-slate-600">{movement.workoutCalories} kcal</span>
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-slate-600">{nutrition.mealCount} meals</span>
            </div>
          </div>

          {/* Energy Level Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Energy Level</span>
              <span className="text-sm text-slate-500">{wellness.energyLevel}%</span>
            </div>
            <Progress 
              value={wellness.energyLevel} 
              className="h-2"
            />
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>{movement.steps.toLocaleString()} steps</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{nutrition.totalCalories} cal</span>
            </div>
          </div>

          {/* View Details Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

