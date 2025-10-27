import React, { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { FitterLogo } from "./FitterLogo";
import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";

interface LoginPageProps {
  onLoginSuccess?: () => void;
  onRegisterClick?: () => void;
}

export function LoginPage({ onLoginSuccess, onRegisterClick }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success("Welcome back!");
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#04101B] via-[#0a1f33] to-[#04101B] flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12">
        <FitterLogo size={80} />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6BF178] to-[#E2F163] bg-clip-text text-transparent mt-8 mb-4">
          Welcome Back
        </h1>
        <p className="text-[#DFF2D4]/80 text-lg text-center max-w-md">
          Continue your wellness journey with AI-powered insights
        </p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <FitterLogo size={48} />
          </div>
          
          <h2 className="text-3xl font-bold text-[#DFF2D4] mb-2 text-center">Sign In</h2>
          <p className="text-[#DFF2D4]/60 mb-8 text-center">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="h-12 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178] rounded-xl"
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="h-12 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178] rounded-xl pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 bottom-0 my-auto flex items-center justify-center h-6 text-[#6BF178] hover:text-[#E2F163] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#6BF178] hover:bg-[#E2F163] text-[#04101B] hover:shadow-lg hover:shadow-[#6BF178]/50 font-bold rounded-xl disabled:opacity-50 transition-all border-2 border-[#6BF178]"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#DFF2D4]/60">
              Don't have an account?{" "}
              <button
                onClick={onRegisterClick}
                className="text-[#6BF178] hover:text-[#E2F163] font-semibold transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

