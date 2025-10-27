import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { FitterLogo } from "./FitterLogo";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";

interface SignupOnboardingProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export function SignupOnboarding({ onComplete, onBack }: SignupOnboardingProps) {
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [ageInput, setAgeInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    goal: "",
    gender: "",
    age: 28,
    height: 165,
    weight: 75,
    activityLevel: "",
  });

  const goals = [
    { value: "lose-weight", label: "Lose Weight" },
    { value: "gain-weight", label: "Gain Weight" },
    { value: "muscle-mass", label: "Muscle Mass Gain" },
    { value: "shape-body", label: "Shape Body" },
    { value: "others", label: "Others" },
  ];

  const genders = [
    { value: "male", label: "Male", icon: "♂" },
    { value: "female", label: "Female", icon: "♀" },
  ];

  const activityLevels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advance" },
  ];

  const handleNext = async () => {
    if (currentStep === 0) {
      // Auth step - validate email/password
      if (!formData.name || !formData.email || !formData.password) {
        toast.error("Please fill in all fields");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
    }

    if (currentStep === 4) {
      // Final step - submit registration
      await handleSubmit();
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep === 0 && onBack) {
      onBack();
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Register user
      await register(formData.email, formData.password, formData.name);

      // Update profile with additional data
      await api.updateProfile({
        goals: [formData.goal],
        gender: formData.gender as "male" | "female" | "other",
        age: formData.age,
        heightCm: formData.height,
        weightKg: formData.weight,
        activityLevel: formData.activityLevel as "beginner" | "intermediate" | "advanced",
        identityComplete: true,
        completedOnboarding: true,
      });

      toast.success("Account created successfully!");
      if (onComplete) onComplete();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04101B] flex flex-col">
      <div className="sticky top-0 z-50 bg-[#04101B] border-b border-[#6BF178] px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:text-[#6BF178] transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <FitterLogo size={36} />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-all ${
                  i <= currentStep ? "bg-[#6BF178]" : "bg-[#6BF178]/20"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 pb-6">
          {currentStep === 0 && (
            <div className="max-w-md mx-auto w-full space-y-6">
              <h1 className="text-3xl font-bold text-white text-center mb-2">Fill Your Profile</h1>
              <p className="text-[#DFF2D4]/70 text-center mb-8">
                You're almost done! Just fill in your details below to complete your account setup and start your journey.
              </p>

              <div className="space-y-4">
                <Input
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178] rounded-xl"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178] rounded-xl"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178] rounded-xl"
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="max-w-md mx-auto w-full space-y-6">
              <h1 className="text-3xl font-bold text-white text-center mb-2">What Is Your Goal?</h1>
              <p className="text-[#DFF2D4]/70 text-center mb-8">
                What's your main objective? Selecting a primary goal helps us customize your workout and nutrition plan to get you there.
              </p>

              <div className="space-y-3">
                {goals.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setFormData({ ...formData, goal: goal.value })}
                    className={`w-full p-4 rounded-xl border-2 transition-all relative ${
                      formData.goal === goal.value
                        ? "bg-[#6BF178] border-[#6BF178] text-[#04101B] shadow-[0_0_30px_rgba(107,241,120,0.6)] scale-105"
                        : "bg-[#0a1f33]/80 border-[#6BF178]/30 text-[#DFF2D4]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{goal.label}</span>
                      {formData.goal === goal.value && <Check className="w-5 h-5" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-md mx-auto w-full space-y-6">
              <h1 className="text-3xl font-bold text-white text-center mb-2">What's Your Gender</h1>
              <p className="text-[#6BF178] bg-[#6BF178]/10 p-4 rounded-xl text-center mb-8">
                This information helps us to accurately calculate your metabolic rate and tailor a fitness plan specific to your body.
              </p>

              <div className="space-y-6">
                {genders.map((gender) => (
                  <button
                    key={gender.value}
                    onClick={() => setFormData({ ...formData, gender: gender.value })}
                    className={`w-full flex flex-col items-center gap-3 p-6 rounded-full border-2 transition-all relative ${
                      formData.gender === gender.value
                        ? "bg-[#6BF178] border-[#6BF178] text-[#04101B] shadow-[0_0_40px_rgba(107,241,120,0.8)] scale-105"
                        : "bg-transparent border-white/30 text-white"
                    }`}
                  >
                    <div className="text-6xl">{gender.icon}</div>
                    <span className="font-bold text-lg">{gender.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="max-w-md mx-auto w-full space-y-6">
              <h1 className="text-3xl font-bold text-white text-center mb-2">Personal Details</h1>
              <p className="text-[#6BF178] bg-[#6BF178]/10 p-4 rounded-xl text-center mb-8">
                We use your age, height, and weight to calculate key health metrics and personalize your plan.
              </p>

              <div className="space-y-6">
                <div>
                  <Label className="text-[#DFF2D4] mb-2 block text-sm font-semibold">Age</Label>
                  <Input
                    type="number"
                    value={ageInput}
                    onChange={(e) => {
                      setAgeInput(e.target.value);
                      setFormData({ ...formData, age: parseInt(e.target.value) || 0 });
                    }}
                    placeholder="Enter your age"
                    className="h-12 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178] rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-[#DFF2D4] mb-2 block text-sm font-semibold">Height (cm)</Label>
                  <Input
                    type="number"
                    value={heightInput}
                    onChange={(e) => {
                      setHeightInput(e.target.value);
                      setFormData({ ...formData, height: parseInt(e.target.value) || 0 });
                    }}
                    placeholder="Enter your height"
                    className="h-12 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178] rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-[#DFF2D4] mb-2 block text-sm font-semibold">Weight (kg)</Label>
                  <Input
                    type="number"
                    value={weightInput}
                    onChange={(e) => {
                      setWeightInput(e.target.value);
                      setFormData({ ...formData, weight: parseInt(e.target.value) || 0 });
                    }}
                    placeholder="Enter your weight"
                    className="h-12 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178] rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="max-w-md mx-auto w-full space-y-6">
              <h1 className="text-3xl font-bold text-white text-center mb-2">Physical Activity Level</h1>
              <p className="text-[#DFF2D4]/70 text-center mb-8">
                Be honest! This helps us create a plan that's challenging enough to get results, but safe for your current fitness level.
              </p>

              <div className="space-y-4">
                {activityLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setFormData({ ...formData, activityLevel: level.value })}
                    className={`w-full p-6 rounded-2xl border-2 transition-all relative flex items-center justify-between ${
                      formData.activityLevel === level.value
                        ? "bg-[#6BF178] border-[#6BF178] text-[#04101B] shadow-[0_0_40px_rgba(107,241,120,0.8)] scale-105"
                        : "bg-[#DFF2D4] border-[#DFF2D4]/30 text-[#04101B]"
                    }`}
                  >
                    <span className="font-bold text-lg">{level.label}</span>
                    {formData.activityLevel === level.value && (
                      <Check className="w-6 h-6 text-[#04101B]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-6 bg-[#04101B] border-t border-[#6BF178]/20">
          <Button
            onClick={handleNext}
            disabled={
              loading ||
              (currentStep === 0 && (!formData.name || !formData.email || !formData.password)) ||
              (currentStep === 1 && !formData.goal) ||
              (currentStep === 2 && !formData.gender) ||
              (currentStep === 3 && (!ageInput || !heightInput || !weightInput)) ||
              (currentStep === 4 && !formData.activityLevel)
            }
            className="w-full h-12 bg-[#6BF178] hover:bg-[#E2F163] text-[#04101B] font-bold rounded-xl disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : currentStep === 4 ? (
              "Start"
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

