import React, { useState } from "react";
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
import { BottomNav } from "./components/BottomNav";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Sparkles, Heart, Brain, Zap } from "lucide-react";
import { ActivityProvider } from "./context/ActivityContext";

type AppView = "landing" | "onboarding" | "assistant" | "dashboard" | "history" | "nutrition" | "profile";

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("landing");

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

  // App pages with bottom navigation
  if (currentView === "assistant" || currentView === "dashboard" || currentView === "history" || currentView === "nutrition") {
    return (
      <ActivityProvider>
        {currentView === "assistant" && <AssistantPage onProfileClick={() => setCurrentView("profile")} />}
        {currentView === "dashboard" && <Dashboard onProfileClick={() => setCurrentView("profile")} />}
        {currentView === "history" && <HistoryPage onProfileClick={() => setCurrentView("profile")} />}
        {currentView === "nutrition" && <NutritionPage onProfileClick={() => setCurrentView("profile")} />}
        <BottomNav 
          currentPage={currentView as "assistant" | "dashboard" | "history" | "nutrition"} 
          onNavigate={(page) => setCurrentView(page)}
        />
      </ActivityProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#04101B] via-[#0a1f33] to-[#04101B]">
      {/* Header */}
      <header className="border-b border-[#6BF178]/20 bg-[#04101B]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <FitterLogo size={40} />
          <nav className="flex items-center gap-8">
            <a href="#features" className="text-[#DFF2D4] hover:text-[#6BF178] transition-colors">
              Features
            </a>
            <a href="#icons" className="text-[#DFF2D4] hover:text-[#6BF178] transition-colors">
              Lifestyle
            </a>
            <Button 
              onClick={() => setCurrentView("assistant")}
              variant="outline"
              className="rounded-full border-[#6BF178] text-[#6BF178] hover:bg-[#6BF178] hover:text-[#04101B]"
            >
              Try App
            </Button>
            <Button 
              onClick={() => setCurrentView("onboarding")}
              className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] hover:shadow-[0_0_20px_rgba(107,241,120,0.5)] text-[#04101B] font-semibold"
            >
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <Badge className="mb-6 rounded-full px-6 py-2 bg-[#6BF178]/20 border border-[#6BF178]/50 text-[#6BF178] backdrop-blur-sm animate-glow">
          <Sparkles className="w-4 h-4 mr-2 inline animate-pulse" />
          AI-Powered Lifestyle Companion
        </Badge>
        
        <h1 className="mx-auto max-w-4xl mb-6 bg-gradient-to-r from-[#6BF178] via-[#E2F163] to-[#6BF178] bg-clip-text text-transparent text-6xl font-bold leading-tight">
          Your Personal AI Lifestyle Companion
        </h1>
        
        <p className="text-[#DFF2D4] max-w-2xl mx-auto mb-12 text-lg">
          Transform your daily routine with intelligent AI guidance. Track wellness, get personalized insights, and achieve your goals with your 24/7 lifestyle companion.
        </p>

        <div className="flex items-center justify-center gap-4 mb-20">
          <Button 
            size="lg" 
            onClick={() => setCurrentView("onboarding")}
            className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] hover:shadow-[0_0_30px_rgba(107,241,120,0.6)] text-[#04101B] font-semibold px-8 text-lg transition-all duration-300"
          >
            Start Your Journey
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => setCurrentView("assistant")}
            className="rounded-full border-[#6BF178] text-[#6BF178] hover:bg-[#6BF178]/10 px-8 text-lg"
          >
            Try Demo
          </Button>
        </div>

        {/* Onboarding Preview */}
        <div className="max-w-4xl mx-auto mb-12 animate-float">
          <OnboardingOrb />
          <p className="mt-8 text-[#DFF2D4]">
            Experience intelligent, personalized guidance from your AI lifestyle companion
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-center mb-4 bg-gradient-to-r from-[#6BF178] to-[#E2F163] bg-clip-text text-transparent text-4xl font-bold">
          AI-Powered Features for Your Best Life
        </h2>
        <p className="text-center text-[#DFF2D4] mb-16 max-w-2xl mx-auto text-lg">
          Built with cutting-edge AI, designed for your success
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 rounded-3xl border-[#6BF178]/30 bg-[#04101B]/60 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(107,241,120,0.3)] transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6BF178] to-[#E2F163] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(107,241,120,0.5)]">
              <Brain className="w-7 h-7 text-[#04101B]" />
            </div>
            <h3 className="mb-3 text-[#6BF178]">Personalized AI Insights</h3>
            <p className="text-[#DFF2D4]/80">
              Get intelligent recommendations tailored to your unique lifestyle, goals, and daily rhythms powered by advanced AI.
            </p>
          </Card>

          <Card className="p-8 rounded-3xl border-[#E2F163]/30 bg-[#04101B]/60 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(226,241,99,0.3)] transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E2F163] to-[#6BF178] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(226,241,99,0.5)]">
              <Heart className="w-7 h-7 text-[#04101B]" />
            </div>
            <h3 className="mb-3 text-[#E2F163]">Holistic Tracking</h3>
            <p className="text-[#DFF2D4]/80">
              Monitor sleep, nutrition, energy, focus, recovery, and balance in one beautiful, intelligent interface.
            </p>
          </Card>

          <Card className="p-8 rounded-3xl border-[#6BF178]/30 bg-[#04101B]/60 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(107,241,120,0.3)] transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6BF178] to-[#DFF2D4] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(107,241,120,0.5)]">
              <Zap className="w-7 h-7 text-[#04101B]" />
            </div>
            <h3 className="mb-3 text-[#6BF178]">24/7 AI Guidance</h3>
            <p className="text-[#DFF2D4]/80">
              Your personal AI companion provides real-time support, motivation, and actionable insights whenever you need them.
            </p>
          </Card>
        </div>
      </section>

      {/* Lifestyle Icons Section */}
      <section id="icons" className="container mx-auto px-6 py-20">
        <h2 className="text-center mb-4 bg-gradient-to-r from-[#6BF178] to-[#E2F163] bg-clip-text text-transparent text-4xl font-bold">
          Six Pillars of Wellness
        </h2>
        <p className="text-center text-[#DFF2D4] mb-16 text-lg">
          Track what matters most for a balanced, fulfilling life
        </p>

        <div className="max-w-6xl mx-auto">
          <svg width="0" height="0">
            <LifestyleIcons />
          </svg>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="max-w-4xl mx-auto p-16 rounded-3xl bg-gradient-to-br from-[#6BF178] via-[#E2F163] to-[#6BF178] border-0 text-center shadow-[0_0_50px_rgba(107,241,120,0.4)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDQsIDE2LCAyNywgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <h2 className="mb-4 text-[#04101B] text-5xl font-bold">Ready to Transform Your Life?</h2>
            <p className="mb-8 text-[#04101B]/80 max-w-2xl mx-auto text-lg font-medium">
              Join thousands of people discovering balance, energy, and wellness through intelligent AI coaching. Your personal lifestyle companion awaits.
            </p>
            <Button 
              size="lg" 
              onClick={() => setCurrentView("onboarding")}
              className="rounded-full bg-[#04101B] text-[#6BF178] hover:bg-[#0a1f33] hover:shadow-[0_0_30px_rgba(4,16,27,0.8)] px-12 py-6 text-lg font-bold transition-all duration-300"
            >
              Start Your Journey Now
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#6BF178]/20 bg-[#04101B]/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <FitterLogo size={36} />
            <div className="flex gap-8 text-[#DFF2D4]">
              <a href="#" className="hover:text-[#6BF178] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#6BF178] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#6BF178] transition-colors">Support</a>
            </div>
          </div>
          <p className="text-center text-[#DFF2D4]/70 mt-8">
            © 2025 Fitter. Your AI-powered journey to balanced wellness.
          </p>
        </div>
      </footer>
    </div>
  );
}
