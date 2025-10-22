import { motion } from "motion/react";
import { MessageCircle, LayoutDashboard, History, Utensils } from "lucide-react";

interface BottomNavProps {
  currentPage: "assistant" | "dashboard" | "history" | "nutrition";
  onNavigate: (page: "assistant" | "dashboard" | "history" | "nutrition") => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    {
      id: "assistant" as const,
      label: "Assistant",
      icon: MessageCircle,
      gradient: "from-violet-400 to-purple-400",
    },
    {
      id: "dashboard" as const,
      label: "Dashboard",
      icon: LayoutDashboard,
      gradient: "from-sky-400 to-cyan-400",
    },
    {
      id: "history" as const,
      label: "History",
      icon: History,
      gradient: "from-indigo-400 to-purple-400",
    },
    {
      id: "nutrition" as const,
      label: "Nutrition",
      icon: Utensils,
      gradient: "from-amber-400 to-orange-400",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-2xl">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-4 gap-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative flex flex-col items-center gap-1 py-2 transition-all"
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.gradient} opacity-10`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Icon */}
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient}`
                        : "bg-slate-100"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? "text-white" : "text-slate-600"
                      }`}
                    />
                  </div>

                  {/* Dot indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-xs transition-colors ${
                    isActive
                      ? "bg-gradient-to-r " + item.gradient + " bg-clip-text text-transparent"
                      : "text-slate-600"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
