import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Pill,
  Droplets,
  Sun,
  Leaf,
  Zap,
  Heart,
  Brain,
  Shield,
  Moon,
  Activity,
  Plus,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";

interface Supplement {
  id: string;
  name: string;
  icon: typeof Pill;
  reason: string;
  category: "recovery" | "focus" | "energy" | "sleep" | "immunity" | "heart";
  benefit: string;
}

export function NutritionRecommender() {
  const [addedSupplements, setAddedSupplements] = useState<string[]>([]);
  const [userSupplements, setUserSupplements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's supplements from backend
  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        setLoading(true);
        const response = await api.getSupplements({ addedToPlan: true });
        
        if (response.success && response.data) {
          setUserSupplements(response.data);
          setAddedSupplements(response.data.map((s: any) => s._id));
        }
      } catch (error) {
        console.error("Failed to fetch supplements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplements();
  }, []);

  const supplements: Supplement[] = [
    {
      id: "magnesium",
      name: "Magnesium",
      icon: Moon,
      reason: "for recovery",
      category: "recovery",
      benefit: "Supports muscle recovery and better sleep quality",
    },
    {
      id: "omega3",
      name: "Omega-3",
      icon: Droplets,
      reason: "for heart health",
      category: "heart",
      benefit: "Essential fatty acids for cardiovascular wellness",
    },
    {
      id: "vitaminD",
      name: "Vitamin D",
      icon: Sun,
      reason: "for immunity",
      category: "immunity",
      benefit: "Boosts immune system and bone health",
    },
    {
      id: "ashwagandha",
      name: "Ashwagandha",
      icon: Leaf,
      reason: "for focus",
      category: "focus",
      benefit: "Reduces stress and improves mental clarity",
    },
    {
      id: "b-complex",
      name: "B-Complex",
      icon: Zap,
      reason: "for energy",
      category: "energy",
      benefit: "Converts food into cellular energy",
    },
    {
      id: "coq10",
      name: "CoQ10",
      icon: Heart,
      reason: "for heart health",
      category: "heart",
      benefit: "Supports cardiovascular function and energy production",
    },
    {
      id: "lions-mane",
      name: "Lion's Mane",
      icon: Brain,
      reason: "for focus",
      category: "focus",
      benefit: "Enhances cognitive function and memory",
    },
    {
      id: "zinc",
      name: "Zinc",
      icon: Shield,
      reason: "for immunity",
      category: "immunity",
      benefit: "Strengthens immune response and wound healing",
    },
    {
      id: "creatine",
      name: "Creatine",
      icon: Activity,
      reason: "for recovery",
      category: "recovery",
      benefit: "Enhances muscle strength and recovery",
    },
  ];

  const getCategoryGradient = (category: Supplement["category"]) => {
    switch (category) {
      case "recovery":
        return "from-indigo-400 to-purple-400";
      case "focus":
        return "from-emerald-400 to-teal-400";
      case "energy":
        return "from-amber-400 to-orange-400";
      case "sleep":
        return "from-blue-400 to-indigo-400";
      case "immunity":
        return "from-rose-400 to-pink-400";
      case "heart":
        return "from-red-400 to-rose-400";
      default:
        return "from-sky-400 to-cyan-400";
    }
  };

  const getCategoryBg = (category: Supplement["category"]) => {
    switch (category) {
      case "recovery":
        return "from-indigo-50 to-purple-50";
      case "focus":
        return "from-emerald-50 to-teal-50";
      case "energy":
        return "from-amber-50 to-orange-50";
      case "sleep":
        return "from-blue-50 to-indigo-50";
      case "immunity":
        return "from-rose-50 to-pink-50";
      case "heart":
        return "from-red-50 to-rose-50";
      default:
        return "from-sky-50 to-cyan-50";
    }
  };

  const handleAddSupplement = async (id: string) => {
    try {
      if (addedSupplements.includes(id)) {
        // Remove from plan
        await api.deleteSupplement(id);
        setAddedSupplements(addedSupplements.filter((s) => s !== id));
        toast.success("Removed from plan");
      } else {
        // Add to plan
        await api.addSupplementToPlan(id);
        setAddedSupplements([...addedSupplements, id]);
        toast.success("Added to plan");
      }
    } catch (error) {
      console.error("Failed to update supplement:", error);
      toast.error("Failed to update supplement");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gradient-modern text-glow text-lg font-bold mb-1">Recommended Supplements</h3>
          <p className="text-[#DFF2D4]/70">Personalized for your wellness goals</p>
        </div>
        {addedSupplements.length > 0 && (
          <Badge className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] border-0 font-semibold shadow-[0_0_15px_rgba(107,241,120,0.4)]">
            {addedSupplements.length} added
          </Badge>
        )}
      </div>

      <div className="relative">
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {supplements.map((supplement, index) => {
              const Icon = supplement.icon;
              const isAdded = addedSupplements.includes(supplement.id);

              return (
                <motion.div
                  key={supplement.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0"
                >
                  <Card
                    className={`w-64 p-5 rounded-3xl modern-card transition-all duration-300 ${
                      isAdded
                        ? "glass-card-intense shadow-[0_0_30px_rgba(107,241,120,0.6)] scale-105 border-[#6BF178]/50"
                        : "border-[#6BF178]/20 hover:border-[#6BF178]/40 hover:shadow-[0_0_20px_rgba(107,241,120,0.3)] hover:scale-102"
                    }`}
                  >
                    {/* Icon and Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <motion.div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getCategoryGradient(
                          supplement.category
                        )} flex items-center justify-center shadow-lg`}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </motion.div>

                      <Badge
                        className="rounded-full border-2 backdrop-blur-md px-3 py-1 text-white font-extrabold"
                        style={{
                          background: `linear-gradient(135deg, ${supplement.category === "recovery" ? "#A855F7" : supplement.category === "focus" ? "#6BF178" : supplement.category === "energy" ? "#F7B801" : supplement.category === "immunity" ? "#FF006E" : supplement.category === "heart" ? "#FF006E" : "#00F5FF"}30, ${supplement.category === "recovery" ? "#6BF178" : supplement.category === "focus" ? "#00F5FF" : supplement.category === "energy" ? "#FF6B35" : supplement.category === "immunity" ? "#FF006E" : supplement.category === "heart" ? "#FF006E" : "#A855F7"}30)`,
                          borderColor: supplement.category === "recovery" ? "#A855F7" : supplement.category === "focus" ? "#6BF178" : supplement.category === "energy" ? "#F7B801" : supplement.category === "immunity" ? "#FF006E" : supplement.category === "heart" ? "#FF006E" : "#00F5FF",
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        }}
                      >
                        {supplement.reason}
                      </Badge>
                    </div>

                    {/* Name */}
                    <h4 className="mb-2 text-[#DFF2D4] font-bold">{supplement.name}</h4>

                    {/* Benefit */}
                    <p className="text-[#DFF2D4]/80 mb-4 min-h-[40px]">{supplement.benefit}</p>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleAddSupplement(supplement.id)}
                      className={`w-full rounded-2xl transition-all duration-300 ${
                        isAdded
                          ? "bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500"
                          : `bg-gradient-to-r ${getCategoryGradient(
                              supplement.category
                            )} hover:opacity-90`
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Added to plan
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add to plan
                        </>
                      )}
                    </Button>

                    {/* Decorative gradient overlay */}
                    {isAdded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-3xl pointer-events-none"
                        style={{
                          background: `linear-gradient(135deg, ${
                            supplement.category === "recovery"
                              ? "rgba(165, 180, 252, 0.1)"
                              : supplement.category === "focus"
                              ? "rgba(110, 231, 183, 0.1)"
                              : supplement.category === "energy"
                              ? "rgba(251, 191, 36, 0.1)"
                              : supplement.category === "immunity"
                              ? "rgba(251, 113, 133, 0.1)"
                              : supplement.category === "heart"
                              ? "rgba(244, 114, 182, 0.1)"
                              : "rgba(125, 211, 252, 0.1)"
                          }, transparent)`,
                        }}
                      />
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Scroll hint gradient */}
        <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-transparent to-transparent pointer-events-none" />
      </div>

      {/* Summary */}
      {addedSupplements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Card className="p-6 rounded-3xl border-white/20 bg-gradient-to-br from-sky-50 to-emerald-50 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-400 flex items-center justify-center flex-shrink-0">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">Your Supplement Plan</h4>
                <p className="text-slate-600 mb-3">
                  You've selected {addedSupplements.length} supplements to support your wellness
                  journey.
                </p>
                <div className="flex flex-wrap gap-2">
                  {supplements
                    .filter((s) => addedSupplements.includes(s.id))
                    .map((supplement) => (
                      <Badge
                        key={supplement.id}
                        className={`rounded-full bg-gradient-to-r ${getCategoryGradient(
                          supplement.category
                        )} text-white border-0`}
                      >
                        {supplement.name}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
