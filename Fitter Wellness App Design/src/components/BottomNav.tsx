import React from "react";
import { motion } from "motion/react";
import { MessageCircle, LayoutDashboard, History, Utensils, Heart } from "lucide-react";

interface BottomNavProps {
  currentPage: "assistant" | "dashboard" | "history" | "nutrition";
  onNavigate: (page: "assistant" | "dashboard" | "history" | "nutrition" | "reflection") => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    
    {
      id: "dashboard" as const,
      label: "Dashboard",
      icon: LayoutDashboard,
      gradient: "from-[#E2F163] to-[#6BF178]",
    },
    {
      id: "history" as const,
      label: "History",
      icon: History,
      gradient: "from-[#6BF178] to-[#DFF2D4]",
    },
    {
      id: "assistant" as const,
      label: "Assistant",
      icon: MessageCircle,
      gradient: "from-[#6BF178] to-[#E2F163]",
    },
    {
      id: "nutrition" as const,
      label: "Nutrition",
      icon: Utensils,
      gradient: "from-[#E2F163] to-[#DFF2D4]",
    },
    {
      id: "reflection" as const,
      label: "Reflection",
      icon: Heart,
      gradient: "from-purple-500 to-pink-500",
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Enhanced Glass morphism background */}
      <div className="relative py-10 h-50 bg-[#04101B]/85 backdrop-blur-3xl border-t-2 border-[#6BF178]/40 shadow-[0_-12px_40px_rgba(107,241,120,0.2)]">
        {/* Glass overlay for extra depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04101B]/90 via-[#04101B]/60 to-[#04101B]/30 backdrop-blur-xl pointer-events-none"></div>
        
        <div className="container mx-auto px-3 sm:px-6 max-w-screen-xl relative z-10 ">
          <div className="flex row justify-between items-center w-full py-4 h-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex flex-col items-center gap-1.5 py-10 px-1 transition-all duration-300 rounded-2xl group ${
                    isActive ? 'transform -translate-y-1' : ''
                  }`}
                >
                  {/* Active background with strong visibility */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-30 shadow-[0_0_20px_rgba(107,241,120,0.4)] border border-white/30`}
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}

                  {/* Icon container with enhanced effects */}
                  <div className="relative z-20">
                    <div
                      className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-br ${item.gradient} shadow-[0_6px_25px_rgba(107,241,120,0.6)] border-2 border-white/40 scale-110`
                          : "bg-[#0a1f33]/60 backdrop-blur-sm border border-[#6BF178]/30 hover:border-[#6BF178]/60 hover:bg-[#0a1f33]/80 hover:shadow-[0_4px_15px_rgba(107,241,120,0.3)] hover:scale-105"
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 sm:w-6 sm:h-6 transition-all duration-300 ${
                          isActive ? "text-[#04101B] drop-shadow-sm" : "text-[#DFF2D4]/90 group-hover:text-[#DFF2D4]"
                        }`}
                        strokeWidth={isActive ? 3 : 2}
                      />
                    </div>

                    {/* Enhanced active dot indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-br from-[#E2F163] to-[#6BF178] shadow-[0_0_15px_rgba(226,241,99,1)] border-2 border-white/50"
                      />
                    )}
                  </div>

                  {/* Enhanced label with strong contrast */}
                  <span
                    className={`text-[15px] md:flex hidden transition-all duration-300 font-medium leading-tight relative z-20 ${
                      isActive
                        ? "text-[#04101B] font-bold drop-shadow-md text-shadow-sm scale-105"
                        : "text-[#DFF2D4]/90 hover:text-[#DFF2D4] group-hover:drop-shadow-sm"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
