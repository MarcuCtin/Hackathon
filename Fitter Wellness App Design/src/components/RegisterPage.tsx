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
    <div className="min-h-screen bg-gradient-modern relative flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="modern-card glass-card-intense p-8 border-2 border-[#6BF178]/40 shadow-lg shadow-[#6BF178]/20">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <FitterLogo size={64} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6BF178] to-[#E2F163] bg-clip-text text-transparent mt-4 flex items-center gap-2">
              Join Fitter
              <Sparkles className="w-6 h-6 text-[#6BF178]" />
            </h1>
            <p className="text-[#DFF2D4]/70 mt-2">Start your wellness journey today</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-[#DFF2D4] mb-2 block font-semibold">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6BF178]" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="pl-10 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178]"
                />
              </div>
            </div>

            <div>
              <Label className="text-[#DFF2D4] mb-2 block font-semibold">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6BF178]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="pl-10 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178]"
                />
              </div>
            </div>

            <div>
              <Label className="text-[#DFF2D4] mb-2 block font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6BF178]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="pl-10 pr-10 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6BF178] hover:text-[#E2F163]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label className="text-[#DFF2D4] mb-2 block font-semibold">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6BF178]" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10 bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 focus:border-[#6BF178]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6BF178] hover:text-[#E2F163]"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] hover:shadow-lg hover:shadow-[#6BF178]/50 font-semibold h-12 text-lg disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#6BF178]/30 to-transparent"></div>
            <span className="px-4 text-[#DFF2D4]/50 text-sm">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#6BF178]/30 to-transparent"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-[#DFF2D4]/70 mb-2">Already have an account?</p>
            <Button
              variant="outline"
              onClick={onLoginClick}
              className="w-full bg-[#0a1f33]/80 border-2 border-[#6BF178]/30 text-[#DFF2D4] hover:border-[#6BF178] hover:bg-[#6BF178]/10"
            >
              Sign In
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

