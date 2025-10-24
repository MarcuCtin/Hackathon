import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { 
  ArrowLeft,
  Droplet, 
  Moon, 
  Dumbbell, 
  Utensils, 
  Activity, 
  TrendingUp,
  Calendar,
  Clock,
  MessageSquare,
  Target,
  Zap
} from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface DayInfoData {
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
    totalCarbs: number;
    totalFat: number;
    mealCount: number;
    mealsByType: {
      breakfast: any[];
      lunch: any[];
      dinner: any[];
      snack: any[];
    };
  };
  activities: Array<{
    id: string;
    type: string;
    value: number;
    unit?: string;
    note?: string;
    timestamp: string;
  }>;
  chatMessages: Array<{
    id: string;
    role: string;
    content: string;
    timestamp: string;
  }>;
}

interface DayInfoPageProps {
  date?: string;
  onBack?: () => void;
}

export function DayInfoPage({ date: propDate, onBack }: DayInfoPageProps) {
  const [data, setData] = useState<DayInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const targetDate = propDate;

  useEffect(() => {
    if (!targetDate) return;

    const fetchDayData = async () => {
      try {
        setLoading(true);
        const response = await api.getDailyWellness(targetDate);
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch day data:", error);
        toast.error("Failed to load day data.");
        if (onBack) {
          onBack();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDayData();
  }, [targetDate, onBack]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">No data found</h2>
          <p className="text-slate-500 mb-4">No wellness data available for this day.</p>
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>
        </div>
      </div>
    );
  }

  const parsedDate = parseISO(data.date);
  const dayName = format(parsedDate, 'EEEE');
  const formattedDate = format(parsedDate, 'MMMM d, yyyy');

  // Calculate wellness color
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
    <div className="flex h-full w-full flex-col bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{dayName}</h1>
            <p className="text-slate-500">{formattedDate}</p>
          </div>
        </div>
        <Badge className={`${getWellnessColor(data.wellness.score)} border-0 text-lg px-4 py-2`}>
          {getWellnessEmoji(data.wellness.score)} {data.wellness.score}% Wellness Score
        </Badge>
      </div>

      {/* Main Content Grid */}
      <div className="grid flex-grow grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Wellness Overview */}
        <Card className="bg-white/80 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Wellness Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Energy Level</span>
                <span className="font-semibold">{data.wellness.energyLevel}%</span>
              </div>
              <Progress value={data.wellness.energyLevel} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-sm text-slate-600">Hydration</div>
                    <div className="font-semibold">{data.wellness.hydration} glasses</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="text-sm text-slate-600">Sleep</div>
                    <div className="font-semibold">{data.wellness.sleepHours}h</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Movement & Activity */}
        <Card className="bg-white/80 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Movement & Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Calories Burned</span>
                <span className="font-semibold text-green-600">{data.movement.workoutCalories} kcal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Steps</span>
                <span className="font-semibold">{data.movement.steps.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Active Minutes</span>
                <span className="font-semibold">{data.movement.activeMinutes} min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Summary */}
        <Card className="bg-white/80 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-500" />
              Nutrition Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Calories</span>
                <span className="font-semibold text-orange-600">{data.nutrition.totalCalories} kcal</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-slate-500">Protein</div>
                  <div className="font-semibold">{data.nutrition.totalProtein}g</div>
                </div>
                <div>
                  <div className="text-slate-500">Carbs</div>
                  <div className="font-semibold">{data.nutrition.totalCarbs}g</div>
                </div>
                <div>
                  <div className="text-slate-500">Fat</div>
                  <div className="font-semibold">{data.nutrition.totalFat}g</div>
                </div>
                <div>
                  <div className="text-slate-500">Meals</div>
                  <div className="font-semibold">{data.nutrition.mealCount}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meals by Type */}
        <Card className="lg:col-span-2 bg-white/80 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Meals by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.nutrition.mealsByType).map(([mealType, meals]) => (
                <div key={mealType} className="space-y-2">
                  <h4 className="font-semibold text-slate-700 capitalize">{mealType}</h4>
                  {meals.length === 0 ? (
                    <p className="text-sm text-slate-500">No {mealType} logged</p>
                  ) : (
                    <div className="space-y-1">
                      {meals.map((meal, index) => (
                        <div key={index} className="text-sm bg-slate-50 p-2 rounded">
                          <div className="font-medium">{meal.items?.map((item: any) => item.name).join(", ") || "Meal"}</div>
                          <div className="text-slate-500">{meal.total?.calories || 0} kcal</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activities Timeline */}
        <Card className="bg-white/80 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Activities Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {data.activities.length === 0 ? (
                <p className="text-center text-slate-500">No activities logged</p>
              ) : (
                <div className="space-y-3">
                  {data.activities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg"
                    >
                      {activity.type === "hydration" && <Droplet className="w-4 h-4 text-blue-500" />}
                      {activity.type === "sleep" && <Moon className="w-4 h-4 text-purple-500" />}
                      {activity.type === "workout" && <Dumbbell className="w-4 h-4 text-green-500" />}
                      {activity.type === "steps" && <Activity className="w-4 h-4 text-orange-500" />}
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {activity.type === "hydration" && `Drank ${activity.value} ${activity.unit}`}
                          {activity.type === "sleep" && `Slept ${activity.value} hours`}
                          {activity.type === "workout" && `Worked out for ${activity.value} ${activity.unit || "kcal"}`}
                          {activity.type === "steps" && `Walked ${activity.value.toLocaleString()} steps`}
                        </div>
                        <div className="text-xs text-slate-500">
                          {format(parseISO(activity.timestamp), "h:mm a")}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        {data.chatMessages.length > 0 && (
          <Card className="lg:col-span-3 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                AI Chat History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {data.chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="mt-1 text-xs opacity-70">
                          {format(parseISO(message.timestamp), "h:mm a")}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
