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
  Zap,
  Sparkles
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
      <div className="flex h-full items-center justify-center bg-gradient-modern">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#6BF178] border-r-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-modern">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#DFF2D4] mb-2">No data found</h2>
          <p className="text-[#DFF2D4]/70 mb-4">No wellness data available for this day.</p>
          <Button 
            onClick={onBack}
            className="bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] border-0 shadow-[0_0_20px_rgba(107,241,120,0.5)] hover:shadow-[0_0_30px_rgba(107,241,120,0.7)]"
          >
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

  const getWellnessIcon = (score: number) => {
    if (score >= 80) return <Sparkles className="w-6 h-6 text-[#04101B]" />;
    if (score >= 60) return <TrendingUp className="w-6 h-6 text-[#04101B]" />;
    return <Moon className="w-6 h-6 text-[#04101B]" />;
  };

  return (
    <div className="flex h-full w-full flex-col bg-gradient-modern p-6 overflow-y-auto">
      <div className="relative z-10 mb-6 flex items-center justify-between sticky top-0 bg-[#04101B]/80 backdrop-blur-md p-4 rounded-2xl border border-[#6BF178]/30 shadow-[0_8px_32px_rgba(107,241,120,0.2)]">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-[#DFF2D4] hover:text-[#6BF178] hover:bg-[#6BF178]/10 border border-[#6BF178]/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gradient-modern text-glow">{dayName}</h1>
            <p className="text-[#DFF2D4]/70">{formattedDate}</p>
          </div>
        </div>
        <Badge className={`rounded-full border-0 shadow-[0_0_20px_rgba(107,241,120,0.5)] bg-gradient-to-r text-lg px-4 py-2 ${
          data.wellness.score >= 80 ? 'from-[#6BF178] to-[#E2F163]' :
          data.wellness.score >= 60 ? 'from-[#E2F163] to-[#6BF178]' :
          'from-[#0a1f33] to-[#0a1f33]/80'
        }`}>
          <div className="flex items-center gap-2 text-[#04101B]">
            {getWellnessIcon(data.wellness.score)}
            <span className="font-semibold">{data.wellness.score}%</span>
          </div>
        </Badge>
      </div>

      <div className="relative z-10 grid flex-grow grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="modern-card glass-card-intense hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#DFF2D4]">
              <Zap className="w-5 h-5 text-[#E2F163]" />
              Wellness Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#DFF2D4]">Energy Level</span>
                <span className="font-semibold text-[#6BF178]">{data.wellness.energyLevel}%</span>
              </div>
              <div className="relative h-3 bg-[#DFF2D4]/20 rounded-full border border-[#6BF178]/30">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${data.wellness.energyLevel}%`,
                    background: 'linear-gradient(90deg, #6BF178, #E2F163)',
                    boxShadow: '0 0 15px rgba(107, 241, 120, 0.6)'
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0a1f33]/50 border border-[#6BF178]/20">
                  <Droplet className="w-5 h-5 text-[#6BF178]" />
                  <div>
                    <div className="text-xs text-[#DFF2D4]/70">Hydration</div>
                    <div className="font-semibold text-[#DFF2D4]">{data.wellness.hydration} glasses</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0a1f33]/50 border border-[#A855F7]/20">
                  <Moon className="w-5 h-5 text-[#A855F7]" />
                  <div>
                    <div className="text-xs text-[#DFF2D4]/70">Sleep</div>
                    <div className="font-semibold text-[#DFF2D4]">{data.wellness.sleepHours}h</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="modern-card glass-card-intense hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#DFF2D4]">
              <Activity className="w-5 h-5 text-[#6BF178]" />
              Movement & Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a1f33]/50 border border-[#E2F163]/20">
                <span className="text-sm text-[#DFF2D4]">Calories Burned</span>
                <span className="font-semibold text-[#E2F163]">{data.movement.workoutCalories} kcal</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a1f33]/50 border border-[#6BF178]/20">
                <span className="text-sm text-[#DFF2D4]">Steps</span>
                <span className="font-semibold text-[#6BF178]">{data.movement.steps.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a1f33]/50 border border-[#FF006E]/20">
                <span className="text-sm text-[#DFF2D4]">Active Minutes</span>
                <span className="font-semibold text-[#FF006E]">{data.movement.activeMinutes} min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="modern-card glass-card-intense hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#DFF2D4]">
              <Utensils className="w-5 h-5 text-[#FF006E]" />
              Nutrition Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a1f33]/50 border border-[#FF006E]/20">
                <span className="text-sm text-[#DFF2D4]">Total Calories</span>
                <span className="font-semibold text-[#FF006E]">{data.nutrition.totalCalories} kcal</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-[#0a1f33]/50 border border-[#6BF178]/20">
                  <div className="text-xs text-[#DFF2D4]/70">Protein</div>
                  <div className="font-semibold text-[#DFF2D4]">{data.nutrition.totalProtein}g</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0a1f33]/50 border border-[#E2F163]/20">
                  <div className="text-xs text-[#DFF2D4]/70">Carbs</div>
                  <div className="font-semibold text-[#DFF2D4]">{data.nutrition.totalCarbs}g</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0a1f33]/50 border border-[#A855F7]/20">
                  <div className="text-xs text-[#DFF2D4]/70">Fat</div>
                  <div className="font-semibold text-[#DFF2D4]">{data.nutrition.totalFat}g</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0a1f33]/50 border border-[#6BF178]/20">
                  <div className="text-xs text-[#DFF2D4]/70">Meals</div>
                  <div className="font-semibold text-[#DFF2D4]">{data.nutrition.mealCount}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 modern-card glass-card-intense hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#DFF2D4]">
              <Target className="w-5 h-5 text-[#6BF178]" />
              Meals by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.nutrition.mealsByType).map(([mealType, meals]) => (
                <div key={mealType} className="space-y-2">
                  <h4 className="font-semibold text-[#DFF2D4] capitalize">{mealType}</h4>
                  {meals.length === 0 ? (
                    <p className="text-sm text-[#DFF2D4]/50">No {mealType} logged</p>
                  ) : (
                    <div className="space-y-1">
                      {meals.map((meal, index) => (
                        <div key={index} className="text-sm bg-[#0a1f33]/50 p-2 rounded border border-[#6BF178]/20">
                          <div className="font-medium text-[#DFF2D4]">{meal.items?.map((item: any) => item.name).join(", ") || "Meal"}</div>
                          <div className="text-[#DFF2D4]/70">{meal.total?.calories || 0} kcal</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="modern-card glass-card-intense hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#DFF2D4]">
              <Clock className="w-5 h-5 text-[#A855F7]" />
              Activities Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {data.activities.length === 0 ? (
                <p className="text-center text-[#DFF2D4]/50">No activities logged</p>
              ) : (
                <div className="space-y-3">
                  {data.activities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 bg-[#0a1f33]/50 rounded-xl border border-[#6BF178]/20"
                    >
                      {activity.type === "hydration" && <Droplet className="w-4 h-4 text-[#6BF178]" />}
                      {activity.type === "sleep" && <Moon className="w-4 h-4 text-[#A855F7]" />}
                      {activity.type === "workout" && <Dumbbell className="w-4 h-4 text-[#E2F163]" />}
                      {activity.type === "steps" && <Activity className="w-4 h-4 text-[#FF006E]" />}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#DFF2D4]">
                          {activity.type === "hydration" && `Drank ${activity.value} ${activity.unit}`}
                          {activity.type === "sleep" && `Slept ${activity.value} hours`}
                          {activity.type === "workout" && `Worked out for ${activity.value} ${activity.unit || "kcal"}`}
                          {activity.type === "steps" && `Walked ${activity.value.toLocaleString()} steps`}
                        </div>
                        <div className="text-xs text-[#DFF2D4]/50">
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

        {data.chatMessages.length > 0 && (
          <Card className="lg:col-span-3 modern-card glass-card-intense hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#DFF2D4]">
                <MessageSquare className="w-5 h-5 text-[#6BF178]" />
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
                        className={`max-w-[70%] rounded-xl p-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] shadow-[0_0_15px_rgba(107,241,120,0.4)]"
                            : "bg-[#0a1f33]/50 text-[#DFF2D4] border border-[#6BF178]/20"
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
