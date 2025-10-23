import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FitterLogo } from "./FitterLogo";
import { api } from "../lib/api";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, X, Sparkles, Loader2, Mail, Lock, User as UserIcon } from "lucide-react";

interface Answer {
  questionId: string;
  value: string;
}

interface Question {
  id: string;
  text: string;
  options: {
    value: string;
    label: string;
    emoji: string;
    emotion?: "calm" | "stressed" | "focused" | "neutral";
  }[];
}

interface OnboardingFormProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingForm({ onComplete, onSkip }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(-1); // Start with auth step
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [emotionalState, setEmotionalState] = useState<"calm" | "stressed" | "focused" | "neutral">("neutral");
  
  // Auth state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Dynamic question flow based on previous answers
  const getQuestions = (): Question[] => {
    const baseQuestions: Question[] = [
      {
        id: "main-goal",
        text: "What's your main goal right now?",
        options: [
          { value: "lose-weight", label: "Lose weight", emoji: "🎯", emotion: "focused" },
          { value: "gain-muscle", label: "Gain muscle", emoji: "💪", emotion: "focused" },
          { value: "be-healthier", label: "Be healthier", emoji: "🌱", emotion: "calm" },
          { value: "live-purpose", label: "Live with purpose", emoji: "✨", emotion: "calm" },
        ],
      },
    ];

    const mainGoal = answers.find((a) => a.questionId === "main-goal")?.value;

    if (mainGoal === "be-healthier") {
      baseQuestions.push({
        id: "healthy-life",
        text: "What defines a healthy life for you?",
        options: [
          { value: "better-sleep", label: "Better sleep quality", emoji: "😴", emotion: "calm" },
          { value: "more-energy", label: "More daily energy", emoji: "⚡", emotion: "focused" },
          { value: "mental-clarity", label: "Mental clarity", emoji: "🧘", emotion: "calm" },
          { value: "balanced-nutrition", label: "Balanced nutrition", emoji: "🥗", emotion: "focused" },
        ],
      });
    } else if (mainGoal === "lose-weight") {
      baseQuestions.push({
        id: "weight-approach",
        text: "What's your preferred approach?",
        options: [
          { value: "gradual", label: "Gradual & sustainable", emoji: "🐢", emotion: "calm" },
          { value: "structured", label: "Structured meal plans", emoji: "📋", emotion: "focused" },
          { value: "flexible", label: "Flexible tracking", emoji: "🎨", emotion: "calm" },
          { value: "active", label: "More active lifestyle", emoji: "🏃", emotion: "focused" },
        ],
      });
    } else if (mainGoal === "gain-muscle") {
      baseQuestions.push({
        id: "muscle-focus",
        text: "What's most important to you?",
        options: [
          { value: "strength", label: "Building strength", emoji: "🏋️", emotion: "focused" },
          { value: "definition", label: "Muscle definition", emoji: "💎", emotion: "focused" },
          { value: "recovery", label: "Proper recovery", emoji: "🛌", emotion: "calm" },
          { value: "nutrition", label: "Nutrition timing", emoji: "⏰", emotion: "focused" },
        ],
      });
    } else if (mainGoal === "live-purpose") {
      baseQuestions.push({
        id: "purpose-area",
        text: "Which area needs the most attention?",
        options: [
          { value: "mindfulness", label: "Daily mindfulness", emoji: "🧠", emotion: "calm" },
          { value: "habits", label: "Building habits", emoji: "📅", emotion: "focused" },
          { value: "relationships", label: "Relationships", emoji: "❤️", emotion: "calm" },
          { value: "growth", label: "Personal growth", emoji: "🌟", emotion: "focused" },
        ],
      });
    }

    // Common follow-up questions
    if (answers.length >= 2) {
      baseQuestions.push({
        id: "current-feeling",
        text: "How are you feeling right now?",
        options: [
          { value: "calm", label: "Calm and relaxed", emoji: "😌", emotion: "calm" },
          { value: "stressed", label: "Stressed or anxious", emoji: "😰", emotion: "stressed" },
          { value: "focused", label: "Focused and energized", emoji: "🎯", emotion: "focused" },
          { value: "tired", label: "Tired but motivated", emoji: "😴", emotion: "calm" },
        ],
      });
    }

    if (answers.length >= 3) {
      baseQuestions.push({
        id: "time-commitment",
        text: "How much time can you dedicate daily?",
        options: [
          { value: "5-min", label: "5-10 minutes", emoji: "⏱️", emotion: "calm" },
          { value: "15-min", label: "15-30 minutes", emoji: "⏰", emotion: "focused" },
          { value: "30-min", label: "30-60 minutes", emoji: "🕐", emotion: "focused" },
          { value: "flexible", label: "Flexible schedule", emoji: "🌊", emotion: "calm" },
        ],
      });
    }

    if (answers.length >= 4) {
      baseQuestions.push({
        id: "tracking-preference",
        text: "How do you prefer to track progress?",
        options: [
          { value: "daily-check", label: "Daily check-ins", emoji: "📱", emotion: "focused" },
          { value: "weekly-review", label: "Weekly reviews", emoji: "📊", emotion: "calm" },
          { value: "ai-insights", label: "AI-driven insights", emoji: "🤖", emotion: "focused" },
          { value: "minimal", label: "Minimal tracking", emoji: "✅", emotion: "calm" },
        ],
      });
    }

    if (answers.length >= 5) {
      baseQuestions.push({
        id: "motivation-style",
        text: "What keeps you motivated?",
        options: [
          { value: "milestones", label: "Hitting milestones", emoji: "🎯", emotion: "focused" },
          { value: "community", label: "Community support", emoji: "👥", emotion: "calm" },
          { value: "data", label: "Seeing the data", emoji: "📈", emotion: "focused" },
          { value: "feeling", label: "How I feel", emoji: "😊", emotion: "calm" },
        ],
      });
    }

    if (answers.length >= 6) {
      baseQuestions.push({
        id: "challenges",
        text: "What's your biggest challenge?",
        options: [
          { value: "consistency", label: "Staying consistent", emoji: "🔄", emotion: "stressed" },
          { value: "motivation", label: "Finding motivation", emoji: "🔥", emotion: "stressed" },
          { value: "knowledge", label: "Knowing what to do", emoji: "📚", emotion: "focused" },
          { value: "time", label: "Making time", emoji: "⏳", emotion: "stressed" },
        ],
      });
    }

    return baseQuestions;
  };

  const questions = getQuestions();
  const totalSteps = 7;
  const currentQuestion = currentStep >= 0 ? questions[currentStep] : null;
  const progress = currentStep < 0 ? 0 : ((currentStep + 1) / totalSteps) * 100;

  // Handler functions - defined before JSX
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoggingIn(true);
    try {
      await api.login(email, password);
      const { data: user } = await api.getMe();
      if (user?.completedOnboarding) {
        toast.success("Welcome back! Redirecting to dashboard.");
        onComplete?.(); // Go to dashboard if onboarding is complete
      } else {
        toast.success("Welcome back! Let's complete your wellness journey.");
        setCurrentStep(0); // Start onboarding if not complete
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsRegistering(true);
    try {
      await api.register(email, password, name);
      toast.success("Welcome to Fitter! Let's personalize your experience.");
      setCurrentStep(0); // Move to first wellness question
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSelectOption = (value: string) => {
    setSelectedOption(value);
  };

  const handleNext = async () => {
    if (selectedOption && currentQuestion) {
      setAnswers([
        ...answers,
        { questionId: currentQuestion.id, value: selectedOption },
      ]);
      setSelectedOption(null);
      
      // If this is the last question, save profile and mark onboarding complete
      if (currentStep === totalSteps - 1) {
        try {
          const goals = answers
            .map(a => a.value)
            .filter(v => v && v !== 'calm' && v !== 'stressed' && v !== 'focused')
            .slice(0, 5);
          
          await api.updateProfile({ goals });
          // Save onboarding answers to backend (simple: send values list)
          const onboardingAnswers = answers.map(a => a.value);
          await api.completeOnboarding({ onboardingAnswers, identityComplete: true });
          toast.success("Profile saved!");
          onComplete?.(); // Call onComplete after saving
        } catch (error) {
          console.error("Profile update error:", error);
          // Continue anyway - profile can be updated later
          onComplete?.();
        }
      }
      
      setCurrentStep(currentStep + 1);
      setEmotionalState("neutral");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const previousAnswer = answers[currentStep - 1];
      setSelectedOption(previousAnswer?.value || null);
      setAnswers(answers.slice(0, -1));
      setEmotionalState("neutral");
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else if (onComplete) {
      onComplete();
    }
  };

  // Get background gradient based on emotional state
  const getBackgroundGradient = () => {
    switch (emotionalState) {
      case "calm":
        return "from-blue-50 via-sky-50 to-cyan-50";
      case "stressed":
        return "from-rose-50 via-red-50 to-orange-50";
      case "focused":
        return "from-emerald-50 via-green-50 to-teal-50";
      default:
        return "from-white via-sky-50 to-emerald-50";
    }
  };

  // Update emotional state based on selected option
  useEffect(() => {
    if (selectedOption && currentQuestion) {
      const selected = currentQuestion.options.find((opt) => opt.value === selectedOption);
      if (selected?.emotion) {
        setEmotionalState(selected.emotion);
      }
    }
  }, [selectedOption, currentQuestion]);

  // Show auth form first
  if (currentStep < 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-emerald-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <FitterLogo size={48} className="mx-auto mb-4" />
            <h2 className="mb-2">Welcome to Fitter 👋</h2>
            <p className="text-slate-600">
              {authMode === "login" ? "Login to your account" : "Create your account to start your wellness journey"}
            </p>
          </div>

          <Card className="p-8 rounded-3xl border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl">
            {authMode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="mb-2 block text-slate-700">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="rounded-2xl border-slate-200"
                    required
                    disabled={isLoggingIn}
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="mb-2 block text-slate-700">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="rounded-2xl border-slate-200"
                    required
                    disabled={isLoggingIn}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoggingIn || !email || !password}
                  className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500 disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging In...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Login
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAuthMode("register")}
                  className="w-full rounded-2xl"
                  disabled={isLoggingIn}
                >
                  Don't have an account? Register
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="name" className="mb-2 block text-slate-700">
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Thompson"
                  className="rounded-2xl border-slate-200"
                  required
                  disabled={isRegistering}
                />
              </div>

              <div>
                <Label htmlFor="email" className="mb-2 block text-slate-700">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="rounded-2xl border-slate-200"
                  required
                  disabled={isRegistering}
                />
              </div>

              <div>
                <Label htmlFor="password" className="mb-2 block text-slate-700">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-2xl border-slate-200"
                  required
                  minLength={8}
                  disabled={isRegistering}
                />
                <p className="text-xs text-slate-500 mt-1">At least 8 characters</p>
              </div>

              <Button
                type="submit"
                disabled={isRegistering || !name || !email || !password}
                className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500 disabled:opacity-50"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setAuthMode("login")}
                className="w-full rounded-2xl"
                disabled={isRegistering}
              >
                Already have an account? Login
              </Button>
            </form>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-emerald-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(56, 189, 248, 0)",
                "0 0 0 20px rgba(56, 189, 248, 0)",
                "0 0 0 0 rgba(56, 189, 248, 0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="mb-4">Your Plan is Ready! 🎉</h2>
          <p className="text-slate-600 mb-8">
            We've created a personalized wellness journey based on your answers.
          </p>
          <Button
            size="lg"
            onClick={onComplete}
            className="rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            View My Plan
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen p-6 relative overflow-hidden"
      animate={{
        background: `linear-gradient(135deg, ${
          emotionalState === "calm"
            ? "#eff6ff, #f0f9ff, #ecfeff"
            : emotionalState === "stressed"
            ? "#fff1f2, #fef2f2, #fff7ed"
            : emotionalState === "focused"
            ? "#f0fdf4, #f0fdf4, #f0fdfa"
            : "#ffffff, #f0f9ff, #ecfeff"
        })`,
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-30"
        animate={{
          background:
            emotionalState === "calm"
              ? "radial-gradient(circle, #60a5fa, transparent)"
              : emotionalState === "stressed"
              ? "radial-gradient(circle, #f87171, transparent)"
              : emotionalState === "focused"
              ? "radial-gradient(circle, #34d399, transparent)"
              : "radial-gradient(circle, #7dd3fc, transparent)",
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-30"
        animate={{
          background:
            emotionalState === "calm"
              ? "radial-gradient(circle, #0ea5e9, transparent)"
              : emotionalState === "stressed"
              ? "radial-gradient(circle, #fb923c, transparent)"
              : emotionalState === "focused"
              ? "radial-gradient(circle, #10b981, transparent)"
              : "radial-gradient(circle, #6ee7b7, transparent)",
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-6">
          <FitterLogo size={32} />
          <div className="flex items-center gap-3">
            <div className="text-slate-500">
              {currentStep + 1} / {totalSteps}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="rounded-full text-slate-500 hover:text-slate-700"
            >
              Skip
              <X className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <Progress value={progress} className="h-3 bg-white/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </Progress>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-slate-900 mb-2">{currentQuestion.text}</h2>
              <p className="text-slate-500">Choose the option that resonates most with you</p>
            </motion.div>

            {/* Options */}
            <div className="grid gap-4 mb-12">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectOption(option.value)}
                  className={`
                    relative p-6 rounded-3xl text-left transition-all duration-300
                    ${
                      selectedOption === option.value
                        ? "bg-white/90 shadow-2xl backdrop-blur-xl"
                        : "bg-white/60 shadow-lg hover:shadow-xl backdrop-blur-sm"
                    }
                  `}
                  style={{
                    border:
                      selectedOption === option.value
                        ? "2px solid transparent"
                        : "2px solid rgba(226, 232, 240, 0.3)",
                    backgroundImage:
                      selectedOption === option.value
                        ? "linear-gradient(white, white), linear-gradient(135deg, #7dd3fc, #6ee7b7)"
                        : "none",
                    backgroundOrigin: "border-box",
                    backgroundClip:
                      selectedOption === option.value ? "padding-box, border-box" : "padding-box",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      className={`
                      flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                      ${
                        selectedOption === option.value
                          ? "bg-gradient-to-br from-sky-100 to-emerald-100"
                          : "bg-slate-100"
                      }
                    `}
                      animate={
                        selectedOption === option.value
                          ? { rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }
                          : {}
                      }
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-3xl">{option.emoji}</span>
                    </motion.div>
                    <div className="flex-1">
                      <span className="text-slate-900 text-lg">{option.label}</span>
                    </div>
                    {selectedOption === option.value && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 flex items-center justify-center shadow-lg"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Glow effect for selected */}
                  {selectedOption === option.value && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(125, 211, 252, 0.15), rgba(110, 231, 183, 0.15))",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="rounded-full border-slate-300 bg-white/50 backdrop-blur-sm disabled:opacity-50 hover:bg-white/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            size="lg"
            onClick={handleNext}
            disabled={!selectedOption}
            className="rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {currentStep === totalSteps - 1 ? "Finish" : "Continue"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Emotional indicator */}
        {emotionalState !== "neutral" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <p className="text-slate-500 text-sm">
              {emotionalState === "calm" && "🌊 Creating a calm environment for you"}
              {emotionalState === "stressed" && "🔥 We understand, let's work through this together"}
              {emotionalState === "focused" && "🎯 Great energy! Let's keep this momentum"}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
