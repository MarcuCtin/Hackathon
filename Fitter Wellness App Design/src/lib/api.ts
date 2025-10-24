// API Client for Fitter Backend
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export interface User {
  _id: string;
  email: string;
  name?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  goals?: string[];
  activityLevel?: "beginner" | "intermediate" | "advanced";
  completedOnboarding?: boolean;
  identityComplete?: boolean;
  onboardingAnswers?: string[];
  createdAt: string;
  updatedAt: string;
}
export interface Log {
  _id: string;
  userId: string;
  type: "workout" | "sleep" | "mood" | "hydration" | "steps" | "custom";
  value: number;
  unit?: string;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionLog {
  _id: string;
  userId: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  items: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Suggestion {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category:
    | "nutrition"
    | "exercise"
    | "sleep"
    | "hydration"
    | "wellness"
    | "recovery";
  priority: "high" | "medium" | "low";
  status: "active" | "completed" | "dismissed";
  emoji: string;
  actionText?: string;
  dismissText?: string;
  generatedAt: string;
  expiresAt?: string;
  completedAt?: string;
  dismissedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  daily: {
    hydration: number;
    workoutCalories: number;
    sleepHours: number;
    mealCount: number;
    totalCalories: number;
    totalProtein: number;
    energyLevel: number;
  };
  recent: {
    logs: Log[];
    nutrition: NutritionLog[];
    chatMessages: ChatMessage[];
    suggestions: Suggestion[];
  };
  stats: {
    totalLogs: number;
    totalNutrition: number;
    totalChatMessages: number;
    activeSuggestions: number;
  };
  analytics: {
    weeklyEnergy: Array<{
      day: string;
      energy: number;
      sleep: number;
    }>;
    nutritionTargets: {
      protein: number;
      carbs: number;
      fats: number;
      water: number;
    };
    nutritionProgress: {
      protein: number;
      carbs: number;
      fats: number;
      water: number;
    };
  };
}

export interface DailySummary {
  _id: string;
  userId: string;
  date: string;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  logs: {
    workouts: number;
    sleepHours: number;
    steps: number;
  };
  insights: string[];
  createdAt: string;
  updatedAt: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Request failed");
    }

    return data;
  }

  // Auth
  async register(email: string, password: string, name?: string) {
    const data = await this.request<{
      success: boolean;
      data: { token: string };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{
      success: boolean;
      data: { token: string };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.data.token);
    return data;
  }

  async getMe() {
    return this.request<{ success: boolean; data: User }>("/auth/me");
  }

  // Profile
  async getProfile() {
    return this.request<{ success: boolean; data: User }>("/profile");
  }

  async updateProfile(updates: Partial<User>) {
    return this.request<{ success: boolean; data: User }>("/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Onboarding complete
  async completeOnboarding(payload: {
    onboardingAnswers: string[];
    identityComplete?: boolean;
  }) {
    return this.request<{ success: boolean; data: User }>(
      "/profile/onboarding/complete",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  // Logs
  async getLogs(params?: {
    from?: string;
    to?: string;
    type?: string;
    limit?: number;
  }) {
    const query = params ? new URLSearchParams(params as any).toString() : "";
    const suffix = query ? `?${query}` : "";
    return this.request<{ success: boolean; data: Log[] }>(`/logs${suffix}`);
  }

  async createLog(log: {
    type: string;
    value: number;
    unit?: string;
    note?: string;
    date: string;
  }) {
    return this.request<{ success: boolean; data: Log }>("/logs", {
      method: "POST",
      body: JSON.stringify(log),
    });
  }

  // Nutrition
  async logMeal(meal: {
    date: string;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    items: Array<{
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
  }) {
    return this.request<{ success: boolean; data: NutritionLog }>(
      "/nutrition/log",
      {
        method: "POST",
        body: JSON.stringify(meal),
      }
    );
  }

  async getNutritionLogs(day?: string) {
    const query = day ? `?day=${day}` : "";
    return this.request<{ success: boolean; data: NutritionLog[] }>(
      `/nutrition/list${query}`
    );
  }

  // AI & Insights
  async chat(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
  ) {
    return this.request<{
      success: boolean;
      data: {
        reply: string;
        actions?: Array<{
          type: string;
          amount?: number;
          hours?: number;
          unit?: string;
          notes?: string;
          calories?: number;
          minutes?: number;
          category?: string;
        }>;
      };
    }>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });
  }

  async getSuggestions() {
    return this.request<{ success: boolean; data: string[] }>("/suggestions");
  }

  async getInsights() {
    return this.request<{ success: boolean; data: DailySummary[] }>(
      "/insights"
    );
  }

  async refreshInsights(day?: string) {
    const query = day ? `?day=${day}` : "";
    return this.request<{ success: boolean }>(`/insights/refresh${query}`, {
      method: "POST",
    });
  }

  // Chat
  async saveChatMessage(message: {
    role: "user" | "assistant";
    content: string;
    sessionId?: string;
  }) {
    return this.request<{ success: boolean; data: ChatMessage }>("/chat/save", {
      method: "POST",
      body: JSON.stringify(message),
    });
  }

  async getChatMessages(sessionId?: string, limit?: number) {
    const params = new URLSearchParams();
    if (sessionId) params.append("sessionId", sessionId);
    if (limit) params.append("limit", limit.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<{ success: boolean; data: ChatMessage[] }>(
      `/chat/messages${query}`
    );
  }

  async getChatSessions() {
    return this.request<{
      success: boolean;
      data: Array<{
        _id: string;
        lastMessage: string;
        messageCount: number;
      }>;
    }>("/chat/sessions");
  }

  // Dashboard
  async getDashboardData() {
    return this.request<{ success: boolean; data: DashboardData }>(
      "/dashboard/data"
    );
  }

  // Suggestions
  async getSuggestions() {
    return this.request<{ success: boolean; data: Suggestion[] }>(
      "/suggestions"
    );
  }

  async completeSuggestion(id: string) {
    return this.request<{ success: boolean; data: Suggestion }>(
      `/suggestions/${id}/complete`,
      {
        method: "POST",
      }
    );
  }

  async dismissSuggestion(id: string) {
    return this.request<{ success: boolean; data: Suggestion }>(
      `/suggestions/${id}/dismiss`,
      {
        method: "POST",
      }
    );
  }

  async generateSuggestions() {
    return this.request<{ success: boolean; data: Suggestion[] }>(
      "/suggestions/generate",
      {
        method: "POST",
      }
    );
  }

  // Daily wellness data
  async getDailyWellness(date: string) {
    return this.request<{
      success: boolean;
      data: {
        date: string;
        wellness: {
          score: number;
          energyLevel: number;
          hydration: number;
          sleepHours: number;
        };
        movement: {
          workoutCalories: number;
          steps: number;
          activeMinutes: number;
        };
        nutrition: {
          totalCalories: number;
          totalProtein: number;
          totalCarbs: number;
          totalFat: number;
          mealCount: number;
          mealsByType: {
            breakfast: any[];
            lunch: any[];
            dinner: any[];
            snack: any[];
          };
        };
        activities: Array<{
          id: string;
          type: string;
          value: number;
          unit?: string;
          note?: string;
          timestamp: string;
        }>;
        chatMessages: Array<{
          id: string;
          role: string;
          content: string;
          timestamp: string;
        }>;
      };
    }>(`/dashboard/daily/${date}`);
  }

  // Workout Plans
  async generateWorkoutPlan() {
    return this.request<{
      success: boolean;
      data: {
        _id: string;
        userId: string;
        planName: string;
        description: string;
        days: Array<{
          day: string;
          restDay?: boolean;
          exercises: Array<{
            name: string;
            muscleGroup: string;
            sets: number;
            reps: string;
            notes?: string;
          }>;
        }>;
        duration: number;
        level: "beginner" | "intermediate" | "advanced";
        generatedAt: string;
        createdAt: string;
        updatedAt: string;
      };
    }>("/workouts/generate", {
      method: "POST",
    });
  }

  async getWorkoutPlans() {
    return this.request<{
      success: boolean;
      data: Array<{
        _id: string;
        userId: string;
        planName: string;
        description: string;
        days: Array<{
          day: string;
          restDay?: boolean;
          exercises: Array<{
            name: string;
            muscleGroup: string;
            sets: number;
            reps: string;
            notes?: string;
          }>;
        }>;
        duration: number;
        level: "beginner" | "intermediate" | "advanced";
        generatedAt: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>("/workouts/plans");
  }

  async getWorkoutPlan(id: string) {
    return this.request<{
      success: boolean;
      data: {
        _id: string;
        userId: string;
        planName: string;
        description: string;
        days: Array<{
          day: string;
          restDay?: boolean;
          exercises: Array<{
            name: string;
            muscleGroup: string;
            sets: number;
            reps: string;
            notes?: string;
          }>;
        }>;
        duration: number;
        level: "beginner" | "intermediate" | "advanced";
        generatedAt: string;
        createdAt: string;
        updatedAt: string;
      };
    }>(`/workouts/plans/${id}`);
  }

  // Daily Tasks
  async getDailyTasks(day?: string) {
    const query = day ? `?day=${day}` : "";
    return this.request<{
      success: boolean;
      data: Array<{
        _id: string;
        userId: string;
        title: string;
        scheduledTime: string;
        date: string;
        category: "wellness" | "nutrition" | "exercise" | "supplements" | "custom";
        completed: boolean;
        completedAt?: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>(`/daily-tasks${query}`);
  }

  async createDailyTask(task: {
    title: string;
    scheduledTime: string;
    date: string;
    category?: "wellness" | "nutrition" | "exercise" | "supplements" | "custom";
  }) {
    return this.request<{
      success: boolean;
      data: any;
    }>("/daily-tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  async completeDailyTask(id: string, completed: boolean) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/daily-tasks/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    });
  }

  async deleteDailyTask(id: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/daily-tasks/${id}`, {
      method: "DELETE",
    });
  }

  // Achievements
  async getAchievements(params?: {
    from?: string;
    to?: string;
    category?: string;
  }) {
    const query = params ? new URLSearchParams(params as any).toString() : "";
    const suffix = query ? `?${query}` : "";
    return this.request<{
      success: boolean;
      data: Array<{
        _id: string;
        userId: string;
        title: string;
        description: string;
        category: "nutrition" | "exercise" | "sleep" | "wellness" | "streak" | "milestone";
        date: string;
        icon?: string;
        progress?: number;
        target?: number;
        createdAt: string;
        updatedAt: string;
      }>;
    }>(`/achievements${suffix}`);
  }

  async getWeeklyAchievements() {
    return this.request<{
      success: boolean;
      data: Array<any>;
    }>("/achievements/weekly-summary");
  }

  async createAchievement(achievement: {
    title: string;
    description: string;
    category: "nutrition" | "exercise" | "sleep" | "wellness" | "streak" | "milestone";
    date: string;
    icon?: string;
    progress?: number;
    target?: number;
  }) {
    return this.request<{
      success: boolean;
      data: any;
    }>("/achievements", {
      method: "POST",
      body: JSON.stringify(achievement),
    });
  }

  // Supplements
  async getSupplements(params?: {
    addedToPlan?: boolean;
    category?: string;
  }) {
    const query = params ? new URLSearchParams(params as any).toString() : "";
    const suffix = query ? `?${query}` : "";
    return this.request<{
      success: boolean;
      data: Array<{
        _id: string;
        userId: string;
        name: string;
        benefit: string;
        description: string;
        dosage?: string;
        frequency?: string;
        icon?: string;
        category?: "recovery" | "immunity" | "energy" | "focus" | "heart" | "general";
        addedToPlan: boolean;
        nutrients?: Record<string, number>;
        createdAt: string;
        updatedAt: string;
      }>;
    }>(`/supplements${suffix}`);
  }

  async createSupplement(supplement: {
    name: string;
    benefit: string;
    description: string;
    dosage?: string;
    frequency?: string;
    icon?: string;
    category?: "recovery" | "immunity" | "energy" | "focus" | "heart" | "general";
  }) {
    return this.request<{
      success: boolean;
      data: any;
    }>("/supplements", {
      method: "POST",
      body: JSON.stringify(supplement),
    });
  }

  async addSupplementToPlan(id: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/supplements/${id}/add-to-plan`, {
      method: "PATCH",
    });
  }

  async deleteSupplement(id: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/supplements/${id}`, {
      method: "DELETE",
    });
  }

  async logSupplement(log: {
    supplementId: string;
    dosage?: string;
    notes?: string;
    date?: string;
  }) {
    return this.request<{
      success: boolean;
      data: any;
    }>("/supplements/log", {
      method: "POST",
      body: JSON.stringify(log),
    });
  }

  async getSupplementNutritionAnalysis() {
    return this.request<{
      success: boolean;
      data: {
        analysis: Array<{
          nutrient: string;
          recommended: number;
          fromFood: number;
          fromSupplements: number;
          total: number;
          percentage: number;
          deficient: boolean;
          deficiencyGap: number;
        }>;
        supplementsTaken: Array<{
          name: string;
          dosage?: string;
          timestamp: string;
        }>;
      };
    }>("/supplements/nutrition-analysis");
  }
}

export const api = new ApiClient();
