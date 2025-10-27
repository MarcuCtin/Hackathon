import React, { useState, useEffect } from "react";
import { FitterLogo } from "./components/FitterLogo";
import { LifestyleIcons } from "./components/LifestyleIcons";
import { OnboardingOrb } from "./components/OnboardingOrb";
import { OnboardingForm } from "./components/OnboardingForm";
import { SignupOnboarding } from "./components/SignupOnboarding";
import { Dashboard } from "./components/Dashboard";
import { AssistantPage } from "./components/AssistantPage";
import { StatePage } from "./components/StatePage";
import { OfMindPage } from "./components/OfMindPage";
import { NutritionPage } from "./components/NutritionPage";
import { HistoryPage } from "./components/HistoryPage";
import { ProfilePage } from "./components/ProfilePage";
import { DayInfoPage } from "./components/DayInfoPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { BottomNav } from "./components/BottomNav";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Sparkles, Heart, Brain, Zap } from "lucide-react";
import { ActivityProvider } from "./context/ActivityContext";
import { useAuth } from "./hooks/useAuth";

type AppView = "landing" | "login" | "register" | "onboarding" | "assistant" | "dashboard" | "history" | "nutrition" | "profile" | "dayinfo";

export default function App() {
  const { isAuthenticated, user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>("landing");
  const [currentParams, setCurrentParams] = useState<{ date?: string }>({});

  // Auto-redirect based on authentication status
  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    if (isAuthenticated && user) {
      // User is logged in
      if (user.completedOnboarding) {
        // User completed onboarding, go to dashboard
        if (currentView === "landing" || currentView === "login" || currentView === "register") {
          setCurrentView("dashboard");
        }
      } else {
        // User logged in but didn't complete onboarding
        if (currentView === "landing" || currentView === "login" || currentView === "register") {
          setCurrentView("onboarding");
        }
      }
    } else {
      // User not logged in
      if (currentView !== "landing" && currentView !== "login" && currentView !== "register") {
        setCurrentView("landing");
      }
    }
  }, [isAuthenticated, user, loading, currentView]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#04101B] via-[#0a1f33] to-[#04101B] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 animate-pulse">
            <FitterLogo size={64} />
          </div>
          <p className="text-[#DFF2D4]">Loading...</p>
        </div>
      </div>
    );
  }

  // Login and Register pages
  if (currentView === "login") {
    return (
      <LoginPage
        onLoginSuccess={() => setCurrentView("dashboard")}
        onRegisterClick={() => setCurrentView("register")}
      />
    );
  }

  if (currentView === "register") {
    return (
      <SignupOnboarding
        onComplete={() => setCurrentView("dashboard")}
        onBack={() => setCurrentView("landing")}
      />
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
    <div className="min-h-screen bg-gradient-modern">
      <header className="sticky top-0 z-50 border-b-2 border-[#6BF178]/30 bg-[#04101B]/98 backdrop-blur-3xl shadow-[0_4px_30px_rgba(107,241,120,0.15)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <FitterLogo size={36} />
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setCurrentView("login")}
                variant="outline"
                className="rounded-xl border-[#6BF178]/30 bg-[#0a1f33]/50 hover:bg-[#6BF178]/20 hover:border-[#6BF178] text-[#DFF2D4]"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setCurrentView("register")}
                className="rounded-xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] hover:shadow-[0_0_20px_rgba(107,241,120,0.5)] text-[#04101B] font-semibold"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-6 py-20 text-center">
        <Badge className="mb-6 rounded-full px-6 py-2 bg-[#6BF178]/20 border border-[#6BF178]/50 text-[#6BF178] backdrop-blur-sm">
          <Sparkles className="w-4 h-4 mr-2 inline" />
          AI-Powered Lifestyle Companion
        </Badge>
        
        <h1 className="mx-auto max-w-4xl mb-6 bg-gradient-to-r from-[#6BF178] via-[#E2F163] to-[#6BF178] bg-clip-text text-transparent text-5xl font-bold leading-tight">
          Your Personal AI Lifestyle Companion
        </h1>
        
        <p className="text-[#DFF2D4] max-w-2xl mx-auto mb-12 text-lg">
          Transform your daily routine with intelligent AI guidance. Track wellness, get personalized insights, and achieve your goals.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16">
          <Button 
            size="lg" 
            onClick={() => setCurrentView("register")}
            className="rounded-xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] hover:shadow-[0_0_30px_rgba(107,241,120,0.6)] text-[#04101B] font-semibold px-8 text-lg transition-all duration-300"
          >
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => setCurrentView("login")}
            className="rounded-xl border-[#6BF178] text-[#6BF178] hover:bg-[#6BF178]/10 px-8 text-lg"
          >
            Sign In
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <h2 className="text-center mb-16 bg-gradient-to-r from-[#6BF178] to-[#E2F163] bg-clip-text text-transparent text-3xl font-bold">
          Why Choose Fitter?
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="modern-card glass-card-intense p-6 rounded-3xl hover-lift">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6BF178] to-[#E2F163] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(107,241,120,0.5)]">
              <Brain className="w-6 h-6 text-[#04101B]" />
            </div>
            <h3 className="mb-2 text-[#6BF178] font-semibold">AI Insights</h3>
            <p className="text-[#DFF2D4]/80 text-sm">
              Get personalized recommendations powered by advanced AI
            </p>
          </Card>

          <Card className="modern-card glass-card-intense p-6 rounded-3xl hover-lift">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E2F163] to-[#6BF178] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(226,241,99,0.5)]">
              <Heart className="w-6 h-6 text-[#04101B]" />
            </div>
            <h3 className="mb-2 text-[#E2F163] font-semibold">Holistic Tracking</h3>
            <p className="text-[#DFF2D4]/80 text-sm">
              Monitor sleep, nutrition, energy, and wellness in one place
            </p>
          </Card>

          <Card className="modern-card glass-card-intense p-6 rounded-3xl hover-lift">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6BF178] to-[#DFF2D4] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(107,241,120,0.5)]">
              <Zap className="w-6 h-6 text-[#04101B]" />
            </div>
            <h3 className="mb-2 text-[#6BF178] font-semibold">24/7 Support</h3>
            <p className="text-[#DFF2D4]/80 text-sm">
              Your AI companion is always ready to help and motivate
            </p>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12 mb-16">
        <Card className="max-w-3xl mx-auto p-12 rounded-3xl bg-gradient-to-br from-[#6BF178] via-[#E2F163] to-[#6BF178] border-0 text-center shadow-[0_0_50px_rgba(107,241,120,0.4)]">
          <h2 className="mb-4 text-[#04101B] text-3xl font-bold">Ready to Start?</h2>
          <p className="mb-8 text-[#04101B]/80 text-lg">
            Join Fitter and transform your wellness journey today
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => setCurrentView("register")}
              className="rounded-xl bg-[#04101B] text-[#6BF178] hover:bg-[#0a1f33] hover:shadow-[0_0_30px_rgba(4,16,27,0.8)] px-8 py-6 text-lg font-bold transition-all duration-300"
            >
              Create Account
            </Button>
            <Button 
              size="lg" 
              onClick={() => setCurrentView("login")}
              className="rounded-xl border-2 border-[#04101B] text-[#04101B] hover:bg-[#04101B]/10 px-8 py-6 text-lg font-bold"
            >
              Sign In
            </Button>
          </div>
        </Card>
      </section>

      <footer className="border-t border-[#6BF178]/20 bg-[#04101B]/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <FitterLogo size={32} />
            <div className="flex gap-6 text-[#DFF2D4] text-sm">
              <a href="#" className="hover:text-[#6BF178] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#6BF178] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#6BF178] transition-colors">Support</a>
            </div>
          </div>
          <p className="text-center text-[#DFF2D4]/70 mt-6 text-sm">
            © 2025 Fitter. AI-powered wellness companion.
          </p>
        </div>
      </footer>
    </div>
  );
}
