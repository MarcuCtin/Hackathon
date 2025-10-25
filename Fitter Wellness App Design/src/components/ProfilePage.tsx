import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { FitterLogo } from "./FitterLogo";
import { UserAvatar } from "./UserAvatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import {
  User,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Target,
  Activity,
  Heart,
  Save,
  Award,
  TrendingUp,
  Zap,
  Moon,
  Apple,
  Sparkles,
  Edit2,
  ArrowLeft,
  Loader2,
  LogOut,
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  targetWeight: string;
  activityLevel: string;
  goals: string[];
  bio: string;
  avatarUrl: string;
}

interface ProfilePageProps {
  onBack?: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    age: "",
    gender: "male",
    height: "",
    weight: "",
    targetWeight: "",
    activityLevel: "moderate",
    goals: [],
    bio: "",
    avatarUrl: "",
  });

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data } = await api.getProfile();
        setProfile({
          name: data.name || "",
          email: data.email,
          age: data.age?.toString() || "",
          gender: "male",
          height: data.heightCm?.toString() || "",
          weight: data.weightKg?.toString() || "",
          targetWeight: "",
          activityLevel: "moderate",
          goals: data.goals || [],
          bio: "",
          avatarUrl: "",
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile({
        name: profile.name,
        age: profile.age ? parseInt(profile.age) : undefined,
        heightCm: profile.height ? parseFloat(profile.height) : undefined,
        weightKg: profile.weight ? parseFloat(profile.weight) : undefined,
        goals: profile.goals,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (newImageUrl: string) => {
    setProfile({ ...profile, avatarUrl: newImageUrl });
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const stats = [
    {
      icon: Target,
      label: "Goals Hit",
      value: "18/21",
      gradient: "from-[#6BF178] to-[#E2F163]",
    },
    {
      icon: Activity,
      label: "Workouts",
      value: "12",
      gradient: "from-[#E2F163] to-[#6BF178]",
    },
    {
      icon: Award,
      label: "Achievements",
      value: "24",
      gradient: "from-[#6BF178] to-[#DFF2D4]",
    },
    {
      icon: Zap,
      label: "Streak",
      value: "7 days",
      gradient: "from-[#E2F163] to-[#DFF2D4]",
    },
  ];

  const healthMetrics = [
    {
      icon: Weight,
      label: "Current Weight",
      value: profile.weight ? `${profile.weight} kg` : "Not set",
      target: profile.targetWeight ? `Target: ${profile.targetWeight} kg` : undefined,
      progress: profile.weight && profile.targetWeight ? ((parseFloat(profile.weight) / parseFloat(profile.targetWeight)) * 100) : undefined,
      gradient: "from-[#6BF178] to-[#E2F163]",
    },
    {
      icon: Ruler,
      label: "Height",
      value: profile.height ? `${profile.height} cm` : "Not set",
      gradient: "from-[#00F5FF] to-[#6BF178]",
    },
    {
      icon: Heart,
      label: "BMI",
      value: profile.weight && profile.height ? (parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2)).toFixed(1) : "Calculate",
      status: profile.weight && profile.height ? "Normal" : undefined,
      gradient: "from-[#A855F7] to-[#6BF178]",
    },
  ];

  const goalBadges = [
    { label: "Weight Loss", color: "from-[#FF006E]/30 to-[#FF6B35]/30", textColor: "text-[#DFF2D4]" },
    { label: "Better Sleep", color: "from-[#A855F7]/30 to-[#6BF178]/30", textColor: "text-[#DFF2D4]" },
    { label: "More Energy", color: "from-[#F7B801]/30 to-[#E2F163]/30", textColor: "text-[#DFF2D4]" },
    { label: "Muscle Gain", color: "from-[#6BF178]/30 to-[#00F5FF]/30", textColor: "text-[#DFF2D4]" },
    { label: "Stress Relief", color: "from-[#00F5FF]/30 to-[#A855F7]/30", textColor: "text-[#DFF2D4]" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#04101B] via-[#0a1f33] to-[#04101B] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#6BF178]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-modern relative pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-[#6BF178]/30 bg-[#04101B]/98 backdrop-blur-3xl shadow-[0_4px_30px_rgba(107,241,120,0.15)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="rounded-full hover:bg-[#6BF178]/20 text-[#6BF178]"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="relative">
                <FitterLogo size={40} />
                <div className="absolute -inset-1 bg-gradient-to-r from-[#6BF178] to-[#E2F163] rounded-full opacity-20 blur-md"></div>
              </div>
              <div>
                <h3 className="text-[#6BF178] font-bold text-xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] bg-clip-text text-transparent">Profile</h3>
                <p className="text-[#DFF2D4]/80 text-sm font-medium">Your wellness journey</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                disabled={saving}
                className={`rounded-2xl px-6 py-2.5 transition-all ${
                  isEditing
                    ? "bg-gradient-to-r from-[#6BF178] to-[#E2F163] hover:shadow-[0_0_25px_rgba(107,241,120,0.6)] hover:scale-105"
                    : "bg-gradient-to-r from-[#E2F163] to-[#6BF178] hover:shadow-[0_0_25px_rgba(226,241,99,0.6)] hover:scale-105"
                } text-[#04101B] font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(107,241,120,0.4)]`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="rounded-2xl border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 px-6 py-2.5 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 relative z-10">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="modern-card glass-card-intense p-8 rounded-3xl hover-lift overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <div className="relative group">
                  <UserAvatar
                    size={140}
                    editable={isEditing}
                    onImageChange={handleAvatarChange}
                    imageUrl={profile.avatarUrl}
                    userName={profile.name}
                  />
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#6BF178] to-[#E2F163] rounded-full opacity-0 group-hover:opacity-30 blur-xl transition-opacity"></div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div>
                  <h2 className="mb-1 text-[#DFF2D4] font-bold text-3xl">{profile.name || "Your Name"}</h2>
                  <p className="text-[#DFF2D4]/70 font-medium flex items-center justify-center lg:justify-start gap-2">
                    <Mail className="w-4 h-4 text-[#6BF178]" />
                    {profile.email || "your.email@example.com"}
                  </p>
                </div>
                
                {!isEditing && profile.bio && (
                  <p className="text-[#DFF2D4]/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {profile.goals.length > 0 ? (
                    profile.goals.map((goal, index) => (
                      <Badge
                        key={index}
                        className="rounded-full border-2 border-[#6BF178]/40 backdrop-blur-md px-3 py-1.5 text-[#6BF178] font-semibold shadow-[0_0_10px_rgba(107,241,120,0.3)] hover:shadow-[0_0_15px_rgba(107,241,120,0.5)] transition-all"
                        style={{
                          background: 'linear-gradient(135deg, rgba(107, 241, 120, 0.15), rgba(226, 241, 99, 0.15))',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {goal}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-[#DFF2D4]/50 italic">No goals set yet</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 lg:w-auto w-full max-w-xs lg:max-w-none">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="bg-gradient-to-br from-[#6BF178]/25 to-[#E2F163]/25 backdrop-blur-md rounded-2xl p-4 text-center border-2 border-[#6BF178]/30 hover:border-[#6BF178]/50 hover:shadow-[0_0_15px_rgba(107,241,120,0.3)] transition-all"
                    >
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center glow-effect-green`}>
                        <Icon className="w-6 h-6 text-[#04101B]" />
                      </div>
                      <div className="text-2xl mb-1 text-gradient-modern font-bold">{stat.value}</div>
                      <div className="text-xs text-[#DFF2D4]/70 font-semibold">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Health Metrics */}
        {!isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] flex items-center justify-center glow-effect-green">
                <Activity className="w-5 h-5 text-[#04101B]" />
              </div>
              <h3 className="text-gradient-modern text-glow text-xl font-bold">Health Metrics</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {healthMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="modern-card glass-card-intense p-6 rounded-3xl hover-lift overflow-hidden group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] flex items-center justify-center glow-effect-green pulse-modern group-hover:scale-110 transition-transform">
                          <Icon className="w-7 h-7 text-[#04101B]" />
                        </div>
                        {metric.status && (
                          <Badge className="rounded-full bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] border-0 font-semibold shadow-[0_0_10px_rgba(107,241,120,0.4)] text-xs">
                            {metric.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[#DFF2D4] mb-2 font-semibold text-sm">{metric.label}</p>
                      <div className="text-3xl mb-1 text-gradient-modern font-bold leading-tight">
                        {metric.value}
                      </div>
                      {metric.target && (
                        <div className="text-sm text-[#DFF2D4]/60 mb-3 flex items-center gap-1">
                          <Target className="w-3 h-3 text-[#6BF178]" />
                          {metric.target}
                        </div>
                      )}
                      {metric.progress && (
                        <div className="relative h-3 bg-[#DFF2D4]/20 rounded-full border border-[#6BF178]/30 overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(100 - metric.progress, 100)}%`,
                              background: 'linear-gradient(90deg, #6BF178, #E2F163)',
                              boxShadow: '0 0 15px rgba(107, 241, 120, 0.6)'
                            }}
                          />
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="modern-card glass-card-intense p-8 rounded-3xl hover-lift overflow-hidden">
              <h3 className="mb-6 text-gradient-modern text-glow text-lg font-bold">Personal Information</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="mb-2 block text-[#DFF2D4] font-semibold">
                    <User className="w-4 h-4 inline mr-2 text-[#6BF178]" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="mb-2 block text-[#DFF2D4] font-semibold">
                    <Mail className="w-4 h-4 inline mr-2 text-[#6BF178]" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50"
                  />
                </div>

                {/* Age */}
                <div>
                  <Label htmlFor="age" className="mb-2 block text-[#DFF2D4] font-semibold">
                    <Calendar className="w-4 h-4 inline mr-2 text-[#6BF178]" />
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50"
                  />
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender" className="mb-2 block text-[#DFF2D4] font-semibold">
                    Gender
                  </Label>
                  <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                    <SelectTrigger className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Height */}
                <div>
                  <Label htmlFor="height" className="mb-2 block text-[#DFF2D4] font-semibold">
                    <Ruler className="w-4 h-4 inline mr-2 text-[#6BF178]" />
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50"
                  />
                </div>

                {/* Weight */}
                <div>
                  <Label htmlFor="weight" className="mb-2 block text-[#DFF2D4] font-semibold">
                    <Weight className="w-4 h-4 inline mr-2 text-[#6BF178]" />
                    Current Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50"
                  />
                </div>

                {/* Target Weight */}
                <div>
                  <Label htmlFor="targetWeight" className="mb-2 block text-[#DFF2D4] font-semibold">
                    <Target className="w-4 h-4 inline mr-2 text-[#6BF178]" />
                    Target Weight (kg)
                  </Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    value={profile.targetWeight}
                    onChange={(e) => setProfile({ ...profile, targetWeight: e.target.value })}
                    className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50"
                  />
                </div>

                {/* Activity Level */}
                <div>
                  <Label htmlFor="activityLevel" className="mb-2 block text-[#DFF2D4] font-semibold">
                    <Activity className="w-4 h-4 inline mr-2 text-[#6BF178]" />
                    Activity Level
                  </Label>
                  <Select
                    value={profile.activityLevel}
                    onValueChange={(value) => setProfile({ ...profile, activityLevel: value })}
                  >
                    <SelectTrigger className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Light Activity</SelectItem>
                      <SelectItem value="moderate">Moderate Activity</SelectItem>
                      <SelectItem value="active">Very Active</SelectItem>
                      <SelectItem value="extreme">Extremely Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Goals */}
              <div className="mt-6">
                <Label className="mb-3 block text-slate-700">
                  <Target className="w-4 h-4 inline mr-2 text-[#6BF178]" />
                  Wellness Goals
                </Label>
                <div className="flex flex-wrap gap-2">
                  {goalBadges.map((goal) => {
                    const isSelected = profile.goals.includes(goal.label);
                    return (
                      <button
                        key={goal.label}
                        onClick={() => {
                          if (isSelected) {
                            setProfile({
                              ...profile,
                              goals: profile.goals.filter((g) => g !== goal.label),
                            });
                          } else {
                            setProfile({
                              ...profile,
                              goals: [...profile.goals, goal.label],
                            });
                          }
                        }}
                        className={`px-4 py-2 rounded-2xl transition-all border-2 font-semibold ${
                          isSelected
                            ? `bg-gradient-to-r ${goal.color} ${goal.textColor} border-[#6BF178] shadow-[0_0_15px_rgba(107,241,120,0.4)]`
                            : "bg-[#0a1f33]/50 text-[#DFF2D4]/60 border-[#6BF178]/20 hover:border-[#6BF178]/40 hover:bg-[#0a1f33]/80"
                        }`}
                      >
                        {goal.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <Label htmlFor="bio" className="mb-2 block text-[#DFF2D4] font-semibold">
                  About You
                </Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself, your wellness journey, and what motivates you..."
                  className="rounded-2xl border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 min-h-[100px]"
                />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="modern-card glass-card-intense p-6 rounded-3xl hover-lift overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#6BF178] to-[#E2F163] flex items-center justify-center flex-shrink-0 glow-effect-green pulse-modern">
                <TrendingUp className="w-6 h-6 text-[#04101B]" />
              </div>
              <div>
                <h4 className="mb-2 text-gradient-modern text-glow font-bold">Your Progress</h4>
                <p className="text-[#DFF2D4]/80">
                  You're making excellent progress towards your goals! You've completed 86% of your
                  weekly targets and maintained a 7-day streak. Keep up the amazing work!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
