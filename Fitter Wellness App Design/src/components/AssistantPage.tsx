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
