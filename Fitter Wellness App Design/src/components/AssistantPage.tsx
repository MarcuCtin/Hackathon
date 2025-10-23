// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { FitterLogo } from "./FitterLogo";
import { UserAvatar } from "./UserAvatar";
import { api } from "../lib/api";
import { toast } from "sonner";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  Heart,
  Moon,
  Utensils,
  AlertCircle,
} from "lucide-react";
import { useActivityData } from "../context/ActivityContext";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  suggestions?: string[];
}

interface AssistantPageProps {
  onProfileClick?: () => void;
}

export function AssistantPage({ onProfileClick }: AssistantPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! 👋 I'm your AI wellness coach. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
      suggestions: [
        "Help me sleep better",
        "Create a workout plan",
        "Suggest healthy meals",
        "Improve my energy",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    hydrationToday,
    workoutCaloriesToday,
    sleepHoursToday,
    mealCountToday,
    addLog,
    addNutritionLog,
  } = useActivityData();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const quickActions = [
    { icon: Moon, label: "Sleep advice", gradient: "from-indigo-400 to-purple-400", prompt: "Give me personalized advice to improve my sleep quality" },
    { icon: Utensils, label: "Meal plan", gradient: "from-emerald-400 to-teal-400", prompt: "Create a healthy meal plan for this week" },
    { icon: TrendingUp, label: "Progress review", gradient: "from-sky-400 to-cyan-400", prompt: "Review my wellness progress and give me feedback" },
    { icon: Heart, label: "Wellness tips", gradient: "from-rose-400 to-pink-400", prompt: "What are some wellness tips to improve my overall health?" },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    const currentInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Build conversation history for AI context
      const conversationHistory = messages
        .slice(-6) // Last 6 messages for context
        .map((msg) => ({
          role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
          content: msg.text,
        }));

      // Call backend AI endpoint
      const { data } = await api.chat([...conversationHistory, { role: "user", content: currentInput }]);

      const aiMessage: Message = {
        id: messages.length + 2,
        text: data.reply,
        sender: "ai",
        timestamp: new Date(),
        suggestions: ["Tell me more", "What else?", "Create a plan"],
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Handle structured actions from AI
      if (data.actions && Array.isArray(data.actions)) {
        const now = new Date().toISOString();
        const persistPromises = data.actions.map((action) => {
          // Handle water/water_log actions
          if ((action.type === "water_log" || action.type === "water") && typeof action.amount === "number") {
            return api
              .createLog({
                type: "hydration",
                value: action.amount,
                unit: action.unit || "glasses",
                date: now,
                note: action.notes,
              })
              .then((result) => {
                if (result?.success && result.data) {
                  addLog(result.data);
                  toast.success(
                    `💧 Hydration logged: ${action.amount} ${action.unit || "glasses"}`
                  );
                  return;
                }
                toast.error("Hydration log failed to save.");
              })
              .catch((error) => {
                console.error("Hydration log failed", error);
                toast.error("Could not save hydration entry.");
              });
          }

          if (action.type === "sleep_log" && typeof action.hours === "number") {
            return api
              .createLog({
                type: "sleep",
                value: action.hours,
                unit: "hours",
                date: now,
                note: action.notes,
              })
              .then((result) => {
                if (result?.success && result.data) {
                  addLog(result.data);
                  toast.success(`Sleep recorded: ${action.hours} hours`);
                  return;
                }
                toast.error("Sleep entry failed to save.");
              })
              .catch((error) => {
                console.error("Sleep log failed", error);
                toast.error("Could not save sleep entry.");
              });
          }

          if (action.type === "workout_log") {
            const caloriesCandidate =
              typeof action.calories === "number"
                ? action.calories
                : typeof action.minutes === "number"
                ? Math.round(action.minutes * 8)
                : null;

            if (caloriesCandidate === null) {
              return Promise.resolve();
            }

            return api
              .createLog({
                type: "workout",
                value: caloriesCandidate,
                unit: "kcal",
                note: action.category || "workout",
                date: now,
              })
              .then((result) => {
                if (result?.success && result.data) {
                  addLog(result.data);
                  toast.success(
                    `Workout logged: ${caloriesCandidate} kcal${
                      action.minutes ? ` in ${action.minutes} min` : ""
                    }`
                  );
                  return;
                }
                toast.error("Workout entry failed to save.");
              })
              .catch((error) => {
                console.error("Workout log failed", error);
                toast.error("Could not save workout entry.");
              });
          }

          if (action.type === "meal_log") {
            const mealType =
              typeof action.category === "string" &&
              ["breakfast", "lunch", "dinner", "snack"].includes(
                action.category.toLowerCase()
              )
                ? action.category.toLowerCase()
                : "lunch";

            const calories =
              typeof action.calories === "number" ? action.calories : 0;

            const description = action.notes || "AI recommended meal";

            return api
              .logMeal({
                date: now,
                mealType,
                items: [
                  {
                    name: description,
                    calories,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                  },
                ],
              })
              .then((result) => {
                if (result?.success && result.data) {
                  addNutritionLog(result.data);
                  toast.success(
                    `Meal saved${calories ? ` · ${calories} kcal` : ""}`
                  );
                  return;
                }
                toast.error("Meal entry failed to save.");
              })
              .catch((error) => {
                console.error("Meal log failed", error);
                toast.error("Could not save meal entry.");
              });
          }

          return Promise.resolve();
        });

        if (persistPromises.length > 0) {
          await Promise.allSettled(persistPromises);
        }
      }
    } catch (error) {
      console.error("AI chat error:", error);
      toast.error("Failed to get AI response. Please try again.");
      
      // Fallback message if API fails
      const fallbackMessage: Message = {
        id: messages.length + 2,
        text: "I'm having trouble connecting right now. Please make sure the backend is running and try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FitterLogo size={36} />
              <div>
                <h3 className="text-slate-900">AI Assistant</h3>
                <p className="text-slate-500">Your wellness companion</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-slate-700 border-0">
                <Bot className="w-3 h-3 mr-1" />
                Online
              </Badge>
              <Badge className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-0">
                🔥 {workoutCaloriesToday} kcal today
              </Badge>
              <Badge className="rounded-full bg-gradient-to-r from-sky-100 to-blue-100 text-blue-700 border-0">
                💧 {hydrationToday} logged
              </Badge>
              <Badge className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0">
                🛌 {sleepHoursToday ?? "-"} h sleep
              </Badge>
              <Badge className="rounded-full bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border-0">
                🥗 {mealCountToday} meals
              </Badge>
              <button onClick={onProfileClick} className="focus:outline-none">
                <UserAvatar size={36} userName="Alex Thompson" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="text-slate-600 mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="p-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 hover:shadow-lg transition-all group"
                >
                  <div
                    className={`w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-r ${action.gradient} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-slate-700">{action.label}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Chat Messages */}
        <Card className="rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
          <ScrollArea className="h-[calc(100vh-450px)] p-6">
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex gap-3 ${
                    message.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-sky-400 to-emerald-400"
                        : "bg-gradient-to-br from-violet-400 to-purple-400"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message */}
                  <div className="flex-1 max-w-[75%]">
                    <div
                      className={`p-4 rounded-2xl ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-sky-400 to-emerald-400 text-white"
                          : "bg-white/80 text-slate-700 border border-white/20"
                      }`}
                    >
                      <p>{message.text}</p>
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1 rounded-full bg-white/80 border border-violet-200 text-violet-600 hover:bg-violet-50 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/80 border border-white/20">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-violet-400"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-violet-400"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-violet-400"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-6 border-t border-white/20">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about your wellness..."
                className="rounded-2xl border-slate-200 bg-white/50"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="rounded-2xl bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
