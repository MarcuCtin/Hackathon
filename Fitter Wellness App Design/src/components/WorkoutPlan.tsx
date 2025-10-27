import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Dumbbell, 
  Calendar, 
  Target, 
  Sparkles,
  Loader2,
  RefreshCw,
  TrendingUp,
  Clock
} from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Exercise {
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  notes?: string;
}

interface WorkoutDay {
  day: string;
  restDay?: boolean;
  exercises: Exercise[];
}

interface WorkoutPlan {
  _id: string;
  planName: string;
  description: string;
  days: WorkoutDay[];
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  generatedAt: string;
}

export function WorkoutPlanComponent() {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadWorkoutPlan();
  }, []);

  const loadWorkoutPlan = async () => {
    try {
      setLoading(true);
      const response = await api.getWorkoutPlans();
      if (response.data && response.data.length > 0) {
        setWorkoutPlan(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to load workout plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewPlan = async () => {
    try {
      setGenerating(true);
      const response = await api.generateWorkoutPlan();
      setWorkoutPlan(response.data);
      toast.success("🎉 New workout plan generated!");
    } catch (error) {
      console.error("Failed to generate workout plan:", error);
      toast.error("Failed to generate workout plan");
    } finally {
      setGenerating(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors: Record<string, string> = {
      'Chest': 'from-red-400 to-pink-400',
      'Back': 'from-blue-400 to-cyan-400',
      'Legs': 'from-purple-400 to-violet-400',
      'Shoulders': 'from-orange-400 to-amber-400',
      'Arms': 'from-indigo-400 to-blue-400',
      'Core': 'from-emerald-400 to-teal-400',
      'Cardio': 'from-rose-400 to-red-400',
    };
    return colors[muscleGroup] || 'from-slate-400 to-slate-500';
  };

  if (loading) {
    return (
      <Card className="bg-white/80 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workoutPlan) {
    return (
      <Card className="bg-white/80 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Workout Plan Yet
            </h3>
            <p className="text-slate-600 mb-6">
              Generate a personalized AI workout plan tailored to your goals and fitness level.
            </p>
            <Button 
              onClick={generateNewPlan}
              disabled={generating}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Workout Plan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Dumbbell className="w-8 h-8" />
                <h2 className="text-2xl font-bold">{workoutPlan.planName}</h2>
              </div>
              <p className="text-blue-100 mb-3">{workoutPlan.description}</p>
              <div className="flex items-center gap-3">
                <Badge className={`${getLevelColor(workoutPlan.level)} border-0 capitalize`}>
                  {workoutPlan.level}
                </Badge>
                <Badge className="bg-white/20 text-white border-0">
                  <Calendar className="w-3 h-3 mr-1" />
                  {workoutPlan.duration} weeks
                </Badge>
                <Badge className="bg-white/20 text-white border-0">
                  <Clock className="w-3 h-3 mr-1" />
                  {workoutPlan.days.filter(d => !d.restDay).length} days/week
                </Badge>
              </div>
            </div>
            <Button
              onClick={generateNewPlan}
              disabled={generating}
              variant="secondary"
              size="sm"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Plan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workout Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workoutPlan.days.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-white/80 shadow-lg backdrop-blur-sm ${
              day.restDay ? 'border-purple-200' : ''
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  {day.day}
                  {day.restDay && (
                    <Badge className="bg-purple-100 text-purple-700 border-0">
                      Rest Day
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {day.restDay ? (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">Active Recovery</p>
                    <p className="text-sm">Rest is essential for muscle growth</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {day.exercises.map((exercise, exIndex) => (
                        <motion.div
                          key={exIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: exIndex * 0.05 }}
                          className="p-4 rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-slate-800">{exercise.name}</h4>
                              <Badge 
                                className={`mt-1 bg-gradient-to-r ${getMuscleGroupColor(exercise.muscleGroup)} text-white border-0`}
                              >
                                {exercise.muscleGroup}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Target className="w-4 h-4" />
                                {exercise.sets} sets × {exercise.reps} reps
                              </div>
                            </div>
                          </div>
                          {exercise.notes && (
                            <p className="text-sm text-slate-600 mt-2 italic">
                              💡 {exercise.notes}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly Summary */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-semibold text-slate-800">Weekly Overview</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {workoutPlan.days.filter(d => !d.restDay).length}
              </div>
              <div className="text-sm text-slate-600">Training Days</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {workoutPlan.days.reduce((sum, day) => sum + day.exercises.length, 0)}
              </div>
              <div className="text-sm text-slate-600">Total Exercises</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {workoutPlan.days.reduce((sum, day) => sum + day.exercises.reduce((exSum, ex) => exSum + ex.sets, 0), 0)}
              </div>
              <div className="text-sm text-slate-600">Total Sets</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {workoutPlan.duration}
              </div>
              <div className="text-sm text-slate-600">Weeks</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



