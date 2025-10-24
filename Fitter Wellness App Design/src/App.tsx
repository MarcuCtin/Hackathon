// @ts-nocheck
import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { FitterLogo } from "./components/FitterLogo";
import { LifestyleIcons } from "./components/LifestyleIcons";
import { OnboardingOrb } from "./components/OnboardingOrb";
import { OnboardingForm } from "./components/OnboardingForm";
import { Dashboard } from "./components/Dashboard";
import { AssistantPage } from "./components/AssistantPage";
import { StatePage } from "./components/StatePage";
import { OfMindPage } from "./components/OfMindPage";
import { NutritionPage } from "./components/NutritionPage";
import { HistoryPage } from "./components/HistoryPage";
import { ProfilePage } from "./components/ProfilePage";
import { DayInfoPage } from "./components/DayInfoPage";
import { BottomNav } from "./components/BottomNav";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Sparkles, Heart, Brain, Zap } from "lucide-react";
import { ActivityProvider } from "./context/ActivityContext";

type AppView = "landing" | "onboarding" | "assistant" | "dashboard" | "history" | "nutrition" | "profile" | "dayinfo";

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("landing");
  const [currentParams, setCurrentParams] = useState<any>({});
  const { user, loading, isAuthenticated } = useAuth();

  // Handle authentication flow
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // User is logged in
        if (user.completedOnboarding) {
          // User completed onboarding → go to dashboard
          setCurrentView("dashboard");
        } else {
          // User not completed onboarding → go to onboarding
          setCurrentView("onboarding");
        }
      } else {
        // User not logged in → show landing page
        setCurrentView("landing");
      }
    }
  }, [user, loading, isAuthenticated]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-emerald-50">
        <FitterLogo size={60} className="animate-pulse" />
      </div>
    );
  }

  if (currentView === "onboarding") {
    return (
      <OnboardingForm
        onComplete={() => setCurrentView("dashboard")}
        onSkip={() => setCurrentView("assistant")}
      />
    );
  }

  // Profile page (no bottom nav)
  if (currentView === "profile") {
    return <ProfilePage onBack={() => setCurrentView("dashboard")} />;
  }

  // Day info page (no bottom nav)
  if (currentView === "dayinfo") {
    return <DayInfoPage date={currentParams.date} onBack={() => setCurrentView("history")} />;
  }

  // App pages with bottom navigation
  if (currentView === "assistant" || currentView === "dashboard" || currentView === "history" || currentView === "nutrition") {
    return (
      <ActivityProvider>
        {currentView === "assistant" && <AssistantPage onProfileClick={() => setCurrentView("profile")} />}
        {currentView === "dashboard" && <Dashboard onProfileClick={() => setCurrentView("profile")} />}
        {currentView === "history" && <HistoryPage onProfileClick={() => setCurrentView("profile")} onNavigate={(view, params) => { setCurrentView(view as AppView); setCurrentParams(params); }} />}
        {currentView === "nutrition" && <NutritionPage onProfileClick={() => setCurrentView("profile")} />}
        <BottomNav 
          currentPage={currentView as "assistant" | "dashboard" | "history" | "nutrition"} 
          onNavigate={(page) => setCurrentView(page)}
        />
      </ActivityProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-emerald-50">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <FitterLogo size={40} />
          <nav className="flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#icons" className="text-slate-600 hover:text-slate-900 transition-colors">
              Lifestyle
            </a>
            <Button 
              onClick={() => setCurrentView("assistant")}
              variant="outline"
              className="rounded-full border-slate-300"
            >
              Try App
            </Button>
            <Button 
              onClick={() => setCurrentView("onboarding")}
              className="rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500"
            >
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <Badge className="mb-6 rounded-full px-6 py-2 bg-gradient-to-r from-sky-100 to-emerald-100 text-slate-700 border-0">
          <Sparkles className="w-4 h-4 mr-2 inline" />
          AI-Powered Lifestyle Coach
        </Badge>
        
        <h1 className="mx-auto max-w-4xl mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
          Balance Your Mind, Body, and Nutrition
        </h1>
        
        <p className="text-slate-600 max-w-2xl mx-auto mb-12">
          Fitter is your intelligent wellness companion, helping you achieve harmony across all aspects of your life with personalized guidance and calm, human-centered design.
        </p>

        <div className="flex items-center justify-center gap-4 mb-20">
          <Button 
            size="lg" 
            onClick={() => setCurrentView("onboarding")}
            className="rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500 px-8"
          >
            Start Your Journey
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => setCurrentView("assistant")}
            className="rounded-full border-slate-300"
          >
            Try Demo
          </Button>
        </div>

        {/* Onboarding Preview */}
        <div className="max-w-4xl mx-auto mb-12">
          <OnboardingOrb />
          <p className="mt-8 text-slate-600">
            Experience calm, intelligent guidance from your AI lifestyle assistant
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-center mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Holistic Wellness, Simplified
        </h2>
        <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">
          Built for modern life, designed for your wellbeing
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 rounded-3xl border-slate-200/50 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center mb-6">
              <Brain className="w-7 h-7 text-sky-600" />
            </div>
            <h3 className="mb-3">Personalized AI Insights</h3>
            <p className="text-slate-600">
              Get intelligent recommendations tailored to your unique lifestyle, goals, and daily rhythms.
            </p>
          </Card>

          <Card className="p-8 rounded-3xl border-slate-200/50 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mb-6">
              <Heart className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="mb-3">Holistic Tracking</h3>
            <p className="text-slate-600">
              Monitor sleep, nutrition, energy, focus, recovery, and balance in one beautiful interface.
            </p>
          </Card>

          <Card className="p-8 rounded-3xl border-slate-200/50 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-emerald-200 flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-cyan-600" />
            </div>
            <h3 className="mb-3">Real-Time Guidance</h3>
            <p className="text-slate-600">
              Receive timely nudges and actionable insights to keep you on track throughout your day.
            </p>
          </Card>
        </div>
      </section>

      {/* Lifestyle Icons Section */}
      <section id="icons" className="container mx-auto px-6 py-20">
        <h2 className="text-center mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Six Pillars of Wellness
        </h2>
        <p className="text-center text-slate-600 mb-16">
          Track what matters most for a balanced life
        </p>

        <div className="max-w-6xl mx-auto">
          <svg width="0" height="0">
            <LifestyleIcons />
          </svg>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="max-w-4xl mx-auto p-16 rounded-3xl bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400 border-0 text-white text-center">
          <h2 className="mb-4 text-white">Ready to Get Fitter?</h2>
          <p className="mb-8 text-sky-50 max-w-2xl mx-auto">
            Join thousands of people discovering balance, energy, and wellness through intelligent AI coaching.
          </p>
          <Button 
            size="lg" 
            onClick={() => setCurrentView("onboarding")}
            className="rounded-full bg-white text-slate-900 hover:bg-slate-50 px-8"
          >
            Start Free Trial
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <FitterLogo size={36} />
            <div className="flex gap-8 text-slate-600">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
            </div>
          </div>
          <p className="text-center text-slate-500 mt-8">
            © 2025 Fitter. Your journey to balanced wellness.
          </p>
        </div>
      </footer>
    </div>
  );
}
