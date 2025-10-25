import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { FitterLogo } from "./FitterLogo";
import { Mail, Lock, Eye, EyeOff, User, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

interface RegisterPageProps {
  onRegisterSuccess?: () => void;
  onLoginClick?: () => void;
}

export function RegisterPage({ onRegisterSuccess, onLoginClick }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await api.register(email, password, name);
      
      if (response.success) {
        toast.success("Account created successfully!");
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
      }
    } catch (error: any) {
      console.error("Register error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#04101B] via-[#0a1f33] to-[#04101B] flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12">
        <FitterLogo size={80} />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6BF178] to-[#E2F163] bg-clip-text text-transparent mt-8 mb-4">
          Join Fitter
        </h1>
        <p className="text-[#DFF2D4]/80 text-lg text-center max-w-md">
          Start your wellness journey with AI-powered lifestyle guidance
        </p>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <FitterLogo size={48} />
          </div>
          
          <h2 className="text-3xl font-bold text-[#DFF2D4] mb-2">Create Account</h2>
          <p className="text-[#DFF2D4]/60 mb-8">Sign up to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="h-12 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178] rounded-xl"
            />

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-12 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178] rounded-xl"
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="h-12 bg-[#0a1f33]/50 border-[#6BF178]/20 text-[#DFF2D4] placeholder:text-[#DFF2D4]/40 focus:border-[#6BF178] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6BF178] hover:text-[#E2F163] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="h-12 bg-[#0a1f33]/50 border-[#6BF178]/20 text-[#DFF2D4] placeholder:text-[#DFF2D4]/40 focus:border-[#6BF178] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6BF178] hover:text-[#E2F163] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] hover:shadow-lg hover:shadow-[#6BF178]/50 font-semibold disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#DFF2D4]/60">
              Already have an account?{" "}
              <button
                onClick={onLoginClick}
                className="text-[#6BF178] hover:text-[#E2F163] font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

