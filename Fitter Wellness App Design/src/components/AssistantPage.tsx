import React, { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
  Trash2,
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  suggestions?: string[];
  actions?: Array<{
    type: string;
    amount?: number;
    hours?: number;
    unit?: string;
    notes?: string;
    calories?: number;
    minutes?: number;
    category?: string;
    micronutrients?: Record<string, number>;
  }>;
}

interface AssistantPageProps {
  onProfileClick?: () => void;
  onDataUpdate?: () => void;
}

export function AssistantPage({ onProfileClick, onDataUpdate }: AssistantPageProps) {
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
  const [selectedDay, setSelectedDay] = useState<string>("today");
  const [messagesByDay, setMessagesByDay] = useState<Array<{day: string, messageCount: number, messages: any[]}>>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages grouped by day
  useEffect(() => {
    const fetchMessagesByDay = async () => {
      try {
        const response = await api.getChatMessagesGroupedByDay();
        if (response.success && response.data) {
          setMessagesByDay(response.data);
          
          // Set today's messages as default
          const today = new Date().toISOString().split('T')[0];
          const todayData = response.data.find((day: any) => day.day === today);
          if (todayData && todayData.messages.length > 0) {
            const formattedMessages = todayData.messages.map((msg: any, idx: number) => ({
              id: idx + 1,
              text: msg.content,
              sender: msg.role === 'user' ? 'user' : 'ai',
              timestamp: new Date(msg.timestamp),
            }));
            setMessages(formattedMessages);
          }
        }
      } catch (error) {
        console.error("Failed to fetch messages by day:", error);
      }
    };
    
    fetchMessagesByDay();
  }, []);

  // Fetch active plan
  useEffect(() => {
    const fetchActivePlan = async () => {
      try {
        const response = await api.getActivePlan();
        if (response.success && response.data) {
          setActivePlan(response.data);
        } else {
          setActivePlan(null);
        }
      } catch (error) {
        console.error("Failed to fetch active plan:", error);
        setActivePlan(null);
      }
    };
    
    fetchActivePlan();
    
    // Refresh every 5 seconds to catch new plans
    const interval = setInterval(fetchActivePlan, 5000);
    
    // Listen for plan changes from other pages
    const handlePlanChange = (event: CustomEvent) => {
      setActivePlan(event.detail.plan);
    };
    window.addEventListener('planChanged', handlePlanChange as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('planChanged', handlePlanChange as EventListener);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [messages, isTyping]);

  const quickActions = [
    { icon: Moon, label: "Sleep advice", gradient: "from-[#6BF178] to-[#E2F163]", prompt: "Give me personalized advice to improve my sleep quality" },
    { icon: Utensils, label: "Meal plan", gradient: "from-[#E2F163] to-[#6BF178]", prompt: "Create a healthy meal plan for this week" },
    { icon: TrendingUp, label: "Progress review", gradient: "from-[#6BF178] to-[#DFF2D4]", prompt: "Review my wellness progress and give me feedback" },
    { icon: Heart, label: "Wellness tips", gradient: "from-[#E2F163] to-[#DFF2D4]", prompt: "What are some wellness tips to improve my overall health?" },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: textToSend,
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
      const { data } = await api.chat([...conversationHistory, { role: "user", content: textToSend }]);

      // Extract reply message (handle both string and object responses)
      let replyText: string = "";
      
      // Check if data.reply exists and has a message field
      if (data.reply) {
        if (typeof data.reply === 'string') {
          replyText = data.reply;
        } else if (typeof data.reply === 'object' && data.reply !== null) {
          const replyObj = data.reply as any;
          // Try to get the message field
          replyText = replyObj.message || replyObj.text || JSON.stringify(replyObj);
        }
      }
      
      // If still no text, try to extract from the data object itself
      if (!replyText && (data as any).message) {
        replyText = typeof (data as any).message === 'string' ? (data as any).message : String((data as any).message);
      }
      
      // Fallback to empty string if still no text
      if (!replyText) {
        replyText = "I received your message but couldn't generate a response. Please try again.";
      }

      // Track plan changes
      let planCreated = false;
      let planCancelled = false;

      // Process actions from AI response
      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          try {
            switch (action.type) {
              case "water_log":
                await api.createLog({
                  type: "hydration",
                  value: action.amount || 1,
                  unit: action.unit || "glasses",
                  date: new Date().toISOString(),
                });
                toast.success(`✅ Logged ${action.amount || 1} ${action.unit || "glasses"} of water`);
                break;
              
              case "sleep_log":
                await api.createLog({
                  type: "sleep",
                  value: action.hours || 0,
                  unit: "hours",
                  date: new Date().toISOString(),
                });
                toast.success(`✅ Logged ${action.hours || 0} hours of sleep`);
                break;
              
              case "workout_log":
                await api.createLog({
                  type: "workout",
                  value: action.calories || (action.minutes || 0) * 10, // Estimate calories if not provided
                  unit: action.calories ? "calories" : "minutes",
                  note: action.category,
                  date: new Date().toISOString(),
                });
                toast.success(`✅ Logged workout`);
                break;
              
              case "meal_log":
                const mealType = (action.category === "breakfast" || action.category === "lunch" || action.category === "dinner" || action.category === "snack") 
                  ? action.category 
                  : "snack";
                await api.logMeal({
                  date: new Date().toISOString(),
                  mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
                  items: [{
                    name: action.notes || "Meal",
                    calories: action.calories || 400,
                    protein: Math.round((action.calories || 400) * 0.15), // Estimate protein
                    carbs: Math.round((action.calories || 400) * 0.5),
                    fat: Math.round((action.calories || 400) * 0.35),
                  }],
                });
                toast.success(`✅ Logged ${mealType}`);
                break;
              
              case "create_plan":
                planCreated = true;
                break;
              
              case "cancel_plan":
                planCancelled = true;
                break;
            }
          } catch (error) {
            console.error(`Failed to process action ${action.type}:`, error);
          }
        }
        
        // Reload active plan if a new plan was created or cancelled
        if (planCreated || planCancelled) {
          try {
            const planResponse = await api.getActivePlan();
            if (planResponse.success && planResponse.data) {
              setActivePlan(planResponse.data);
              if (planCreated) {
                toast.success(`🎉 Plan "${planResponse.data.planName}" is now active!`);
              }
            } else {
              // No active plan found
              setActivePlan(null);
            }

            // Broadcast plan change event to other pages
            window.dispatchEvent(new CustomEvent('planChanged', {
              detail: { plan: planResponse.success && planResponse.data ? planResponse.data : null }
            }));
          } catch (error) {
            console.error("Failed to reload active plan:", error);
            setActivePlan(null);

            // Broadcast that plan was cleared
            window.dispatchEvent(new CustomEvent('planChanged', { detail: { plan: null } }));
          }
        }
        
        // Refresh dashboard data if callback provided
        if (onDataUpdate) {
          onDataUpdate();
        }
      }

      const aiMessage: Message = {
        id: messages.length + 2,
        text: replyText,
        sender: "ai",
        timestamp: new Date(),
        suggestions: ["Tell me more", "What else?", "Create a plan"],
        actions: data.actions,
      };

      setMessages((prev) => [...prev, aiMessage]);
      
      // Show toast for logged actions
      if (data.actions && data.actions.length > 0) {
        toast.success(`Logged ${data.actions.length} action(s) successfully!`);
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

  const handleSend = () => {
    handleSendMessage();
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Auto-submit the suggestion
    handleSendMessage(suggestion);
  };

  const handleClearChat = () => {
    // Reset to initial welcome message
    setMessages([
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
    setSelectedDay("today");
    toast.success("Chat cleared");
  };

  return (
    <div className="min-h-screen bg-gradient-modern relative pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-[#6BF178]/30 bg-[#04101B]/98 backdrop-blur-3xl shadow-[0_4px_30px_rgba(107,241,120,0.15)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <FitterLogo size={36} />
            <div className="flex items-center gap-3">
              {activePlan ? (
                <Badge className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 font-semibold shadow-[0_0_15px_rgba(168,85,247,0.4)] whitespace-nowrap px-3 py-1">
                  {activePlan.planType === 'cutting' && '🔥'}
                  {activePlan.planType === 'bulking' && '💪'}
                  {activePlan.planType === 'maintenance' && '⚖️'}
                  {activePlan.planType === 'healing' && '💚'}
                  {activePlan.planType === 'custom' && '✨'}
                  {' '}{activePlan.planName}
                </Badge>
              ) : (
                <Badge className="rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50 font-medium whitespace-nowrap px-3 py-1">
                  📋 Currently no plan set
                </Badge>
              )}
              <button 
                onClick={handleClearChat}
                className="p-2 rounded-full bg-[#0a1f33]/60 hover:bg-[#FF006E]/20 border border-[#6BF178]/30 hover:border-[#FF006E]/50 transition-all backdrop-blur-sm"
                title="Clear chat"
              >
                <Trash2 className="w-5 h-5 text-[#DFF2D4]" />
              </button>
              <button 
                onClick={onProfileClick} 
                className="focus:outline-none hover:scale-110 transition-transform duration-300"
              >
                <UserAvatar size={40} userName="Alex Thompson" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 relative z-10">
        {/* Chat Messages */}
        <Card className="modern-card glass-card-intense rounded-3xl overflow-hidden">
          <div className="flex flex-col relative" style={{height: 'calc(100vh - 200px)', minHeight: '600px', maxHeight: 'calc(100vh - 200px)'}}>
            {/* Day Tabs */}
            {messagesByDay.length > 0 && (
              <div className="border-b border-[#6BF178]/20 px-6 py-4 bg-[#04101B]/40 backdrop-blur-sm">
                <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(107, 241, 120, 0.3) transparent'}}>
                  {messagesByDay.map((dayData) => {
                    const isToday = dayData.day === new Date().toISOString().split('T')[0];
                    const isSelected = selectedDay === dayData.day;
                    const dayLabel = isToday ? 'Today' : new Date(dayData.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    
                    return (
                      <button
                        key={dayData.day}
                        onClick={() => {
                          setSelectedDay(dayData.day);
                          const formattedMessages = dayData.messages.map((msg: any, idx: number) => ({
                            id: idx + 1,
                            text: msg.content,
                            sender: msg.role === 'user' ? 'user' : 'ai',
                            timestamp: new Date(msg.timestamp),
                          }));
                          setMessages(formattedMessages);
                        }}
                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium text-sm ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] font-semibold shadow-[0_0_15px_rgba(107,241,120,0.4)]'
                            : 'bg-[#0a1f33]/60 text-[#DFF2D4] hover:bg-[#0a1f33]/80 border border-[#6BF178]/20'
                        }`}
                      >
                        {isToday && <span className="mr-1">📅</span>}
                        {dayLabel} 
                        <span className={`ml-1.5 ${isSelected ? 'text-[#04101B]/70' : 'text-[#6BF178]'}`}>
                          ({dayData.messageCount})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10" style={{scrollBehavior: 'smooth', scrollbarWidth: 'thin', scrollbarColor: 'rgba(107, 241, 120, 0.5) transparent'}}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-[#E2F163] to-[#6BF178] border-[#E2F163] shadow-[0_0_20px_rgba(226,241,99,0.5)]"
                        : "bg-gradient-to-br from-[#6BF178] to-[#E2F163] border-[#6BF178] shadow-[0_0_20px_rgba(107,241,120,0.5)]"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-6 h-6 text-[#04101B]" />
                    ) : (
                      <Bot className="w-6 h-6 text-[#04101B]" />
                    )}
                  </div>

                  {/* Message */}
                  <div className="flex-1 max-w-[75%] min-w-0">
                    <div
                      className={`p-4 rounded-2xl backdrop-blur-md border-2 ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-[#E2F163] to-[#6BF178] text-[#04101B] font-semibold shadow-[0_0_20px_rgba(226,241,99,0.4)] border-[#E2F163]/50"
                          : "bg-[#0a1f33]/95 text-[#DFF2D4] border-[#6BF178]/40 shadow-[0_0_15px_rgba(107,241,120,0.3)]"
                      }`}
                    >
                      <p className="break-words text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {message.suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#0a1f33] to-[#0a1f33]/80 border-2 border-[#6BF178]/40 text-[#6BF178] hover:bg-gradient-to-r hover:from-[#6BF178] hover:to-[#E2F163] hover:text-[#04101B] hover:border-[#6BF178] transition-all duration-300 text-xs font-semibold shadow-[0_2px_10px_rgba(107,241,120,0.2)] hover:shadow-[0_4px_20px_rgba(107,241,120,0.4)] hover:scale-105"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#6BF178] to-[#E2F163] flex items-center justify-center border-2 border-[#6BF178] shadow-[0_0_20px_rgba(107,241,120,0.5)] animate-pulse-slow">
                    <Bot className="w-6 h-6 text-[#04101B]" />
                  </div>
                  <div className="p-3 rounded-2xl bg-[#0a1f33]/95 border-2 border-[#6BF178]/40 shadow-[0_0_15px_rgba(107,241,120,0.3)] backdrop-blur-md">
                    <div className="flex items-center gap-1.5 px-2">
                      <span className="text-[#6BF178] text-xs font-semibold mr-1">AI is typing</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6BF178] shadow-[0_0_6px_rgba(107,241,120,0.8)] animate-bounce" style={{animationDuration: '0.6s', animationDelay: '0s'}} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E2F163] shadow-[0_0_6px_rgba(226,241,99,0.8)] animate-bounce" style={{animationDuration: '0.6s', animationDelay: '0.15s'}} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6BF178] shadow-[0_0_6px_rgba(107,241,120,0.8)] animate-bounce" style={{animationDuration: '0.6s', animationDelay: '0.3s'}} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input - Fixed at bottom */}
            <div className="p-4 border-t border-[#6BF178]/20 bg-[#04101B]/60 backdrop-blur-xl flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about your wellness..."
                className="flex-1 rounded-2xl border-2 border-[#6BF178]/30 bg-[#0a1f33]/80 text-[#DFF2D4] placeholder:text-[#DFF2D4]/40 focus:border-[#6BF178] focus:ring-2 focus:ring-[#6BF178]/30 backdrop-blur-sm px-4 py-3 font-medium"
                style={{
                  color: input ? '#DFF2D4' : undefined
                }}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="rounded-2xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] hover:shadow-[0_0_25px_rgba(107,241,120,0.6)] text-[#04101B] font-semibold flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-[56px] h-[48px] p-0 transition-all"
              >
                <Send className="w-5 h-5" />
              </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions - Compact version */}
        <div className="mt-4">
          <p className="text-[#DFF2D4]/70 mb-2 text-xs font-medium">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#04101B]/60 backdrop-blur-xl border border-[#6BF178]/30 hover:shadow-[0_0_15px_rgba(107,241,120,0.3)] hover:border-[#6BF178] transition-all group"
                >
                  <div
                    className={`w-6 h-6 rounded-lg bg-gradient-to-r ${action.gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#04101B]" />
                  </div>
                  <p className="text-[#DFF2D4] text-xs font-medium">{action.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
