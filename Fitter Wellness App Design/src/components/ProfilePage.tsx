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

  const stats = [
    {
      icon: Target,
      label: "Goals Hit",
      value: "18/21",
      gradient: "from-emerald-400 to-teal-400",
    },
    {
      icon: Activity,
      label: "Workouts",
      value: "12",
      gradient: "from-violet-400 to-purple-400",
    },
    {
      icon: Award,
      label: "Achievements",
      value: "24",
      gradient: "from-amber-400 to-orange-400",
    },
    {
      icon: Zap,
      label: "Streak",
      value: "7 days",
      gradient: "from-sky-400 to-cyan-400",
    },
  ];

  const healthMetrics = [
    {
      icon: Weight,
      label: "Current Weight",
      value: `${profile.weight} kg`,
      target: `Target: ${profile.targetWeight} kg`,
      progress: ((parseFloat(profile.weight) / parseFloat(profile.targetWeight)) * 100),
      gradient: "from-rose-400 to-pink-400",
    },
    {
      icon: Ruler,
      label: "Height",
      value: `${profile.height} cm`,
      gradient: "from-sky-400 to-cyan-400",
    },
    {
      icon: Heart,
      label: "BMI",
      value: (parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2)).toFixed(1),
      status: "Normal",
      gradient: "from-emerald-400 to-teal-400",
    },
  ];

  const goalBadges = [
    { label: "Weight Loss", color: "from-rose-100 to-pink-100", textColor: "text-rose-700" },
    { label: "Better Sleep", color: "from-indigo-100 to-purple-100", textColor: "text-indigo-700" },
    { label: "More Energy", color: "from-amber-100 to-orange-100", textColor: "text-amber-700" },
    { label: "Muscle Gain", color: "from-emerald-100 to-teal-100", textColor: "text-emerald-700" },
    { label: "Stress Relief", color: "from-sky-100 to-cyan-100", textColor: "text-sky-700" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <FitterLogo size={36} />
              <div>
                <h3 className="text-slate-900">Profile</h3>
                <p className="text-slate-500">Your wellness journey</p>
              </div>
            </div>
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={saving}
              className={`rounded-2xl ${
                isEditing
                  ? "bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500"
                  : "bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-500 hover:to-cyan-500"
              } disabled:opacity-50`}
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
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-8 rounded-3xl border-white/20 bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400 text-white shadow-2xl">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <UserAvatar
                size={120}
                editable={isEditing}
                onImageChange={handleAvatarChange}
                imageUrl={profile.avatarUrl}
                userName={profile.name}
              />

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="mb-2 text-white">{profile.name}</h2>
                <p className="text-white/80 mb-4">{profile.email}</p>
                
                {!isEditing && profile.bio && (
                  <p className="text-white/90 mb-4 max-w-2xl">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile.goals.map((goal, index) => (
                    <Badge
                      key={index}
                      className="rounded-full bg-white/20 text-white border-0 backdrop-blur-sm"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center"
                    >
                      <Icon className="w-5 h-5 mx-auto mb-2" />
                      <div className="text-2xl mb-1">{stat.value}</div>
                      <div className="text-xs text-white/80">{stat.label}</div>
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
            <h3 className="mb-4">Health Metrics</h3>
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
                    <Card className="p-6 rounded-3xl border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
                      <div
                        className={`w-12 h-12 mb-4 rounded-2xl bg-gradient-to-r ${metric.gradient} flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-slate-600 mb-2">{metric.label}</p>
                      <div className="text-3xl mb-1 bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent">
                        {metric.value}
                      </div>
                      {metric.target && (
                        <div className="text-sm text-slate-500 mb-2">{metric.target}</div>
                      )}
                      {metric.status && (
                        <Badge className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0">
                          {metric.status}
                        </Badge>
                      )}
                      {metric.progress && (
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
                          <div
                            className={`h-full bg-gradient-to-r ${metric.gradient} rounded-full transition-all`}
                            style={{ width: `${Math.min(100 - metric.progress, 100)}%` }}
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
            <Card className="p-8 rounded-3xl border-white/20 bg-white/80 backdrop-blur-xl shadow-xl">
              <h3 className="mb-6">Personal Information</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="mb-2 block text-slate-700">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="rounded-2xl border-slate-200 bg-white/50"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="mb-2 block text-slate-700">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="rounded-2xl border-slate-200 bg-white/50"
                  />
                </div>

                {/* Age */}
                <div>
                  <Label htmlFor="age" className="mb-2 block text-slate-700">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    className="rounded-2xl border-slate-200 bg-white/50"
                  />
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender" className="mb-2 block text-slate-700">
                    Gender
                  </Label>
                  <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                    <SelectTrigger className="rounded-2xl border-slate-200 bg-white/50">
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
                  <Label htmlFor="height" className="mb-2 block text-slate-700">
                    <Ruler className="w-4 h-4 inline mr-2" />
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    className="rounded-2xl border-slate-200 bg-white/50"
                  />
                </div>

                {/* Weight */}
                <div>
                  <Label htmlFor="weight" className="mb-2 block text-slate-700">
                    <Weight className="w-4 h-4 inline mr-2" />
                    Current Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    className="rounded-2xl border-slate-200 bg-white/50"
                  />
                </div>

                {/* Target Weight */}
                <div>
                  <Label htmlFor="targetWeight" className="mb-2 block text-slate-700">
                    <Target className="w-4 h-4 inline mr-2" />
                    Target Weight (kg)
                  </Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    value={profile.targetWeight}
                    onChange={(e) => setProfile({ ...profile, targetWeight: e.target.value })}
                    className="rounded-2xl border-slate-200 bg-white/50"
                  />
                </div>

                {/* Activity Level */}
                <div>
                  <Label htmlFor="activityLevel" className="mb-2 block text-slate-700">
                    <Activity className="w-4 h-4 inline mr-2" />
                    Activity Level
                  </Label>
                  <Select
                    value={profile.activityLevel}
                    onValueChange={(value) => setProfile({ ...profile, activityLevel: value })}
                  >
                    <SelectTrigger className="rounded-2xl border-slate-200 bg-white/50">
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
                  <Target className="w-4 h-4 inline mr-2" />
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
                        className={`px-4 py-2 rounded-2xl transition-all ${
                          isSelected
                            ? `bg-gradient-to-r ${goal.color} ${goal.textColor} border-2 border-current`
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                <Label htmlFor="bio" className="mb-2 block text-slate-700">
                  About You
                </Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself, your wellness journey, and what motivates you..."
                  className="rounded-2xl border-slate-200 bg-white/50 min-h-[100px]"
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
          <Card className="p-6 rounded-3xl border-white/20 bg-gradient-to-br from-violet-50 to-purple-50 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-violet-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="mb-2">Your Progress</h4>
                <p className="text-slate-600">
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
