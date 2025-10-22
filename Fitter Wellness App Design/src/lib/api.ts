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
    // Load token from localStorage on init
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

  // Logs
  async getLogs(params?: {
    from?: string;
    to?: string;
    type?: string;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; data: Log[] }>(`/logs?${query}`);
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
    return this.request<{ success: boolean; data: { reply: string } }>(
      "/ai/chat",
      {
        method: "POST",
        body: JSON.stringify({ messages }),
      }
    );
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
}

export const api = new ApiClient();
