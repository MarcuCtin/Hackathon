# Frontend Integration Guide

## Overview

The backend runs on `http://localhost:4000` by default. All API routes are prefixed with `/api`.

## Integration Options

### Option 1: Next.js Proxy (Recommended)

Add to `next.config.js`:

```js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};
```

### Option 2: Direct CORS (Development)

Backend already has CORS enabled. Call directly:

```typescript
const API_URL = 'http://localhost:4000/api';

fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

## API Client Example

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  }

  // Auth
  async register(email: string, password: string, name?: string) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.data.token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Profile
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(updates: any) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Logs
  async getLogs(params?: { from?: string; to?: string; type?: string; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/logs?${query}`);
  }

  async createLog(log: {
    type: string;
    value: number;
    unit?: string;
    note?: string;
    date: string;
  }) {
    return this.request('/logs', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  // Nutrition
  async logMeal(meal: {
    date: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    items: Array<{ name: string; calories: number; protein: number; carbs: number; fat: number }>;
  }) {
    return this.request('/nutrition/log', {
      method: 'POST',
      body: JSON.stringify(meal),
    });
  }

  async getNutritionLogs(day?: string) {
    const query = day ? `?day=${day}` : '';
    return this.request(`/nutrition/list${query}`);
  }

  // AI & Insights
  async chat(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  async getSuggestions() {
    return this.request('/suggestions');
  }

  async getInsights() {
    return this.request('/insights');
  }

  async refreshInsights(day?: string) {
    const query = day ? `?day=${day}` : '';
    return this.request(`/insights/refresh${query}`, { method: 'POST' });
  }
}

export const api = new ApiClient();
```

## React Hook Example

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data } = await api.getMe();
        setUser(data);
      } catch (err) {
        console.error('Not authenticated');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(email: string, password: string) {
    await api.login(email, password);
    const { data } = await api.getMe();
    setUser(data);
  }

  async function register(email: string, password: string, name?: string) {
    await api.register(email, password, name);
    const { data } = await api.getMe();
    setUser(data);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return { user, loading, login, register, logout };
}
```

## Component Examples

### Login Form

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (err) {
      alert('Login failed');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

### AI Chat

```typescript
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export function AiChat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');

  async function sendMessage() {
    const userMessage = { role: 'user' as const, content: input };
    setMessages([...messages, userMessage]);
    setInput('');

    const { data } = await api.chat([...messages, userMessage]);
    setMessages([...messages, userMessage, { role: 'assistant', content: data.reply }]);
  }

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

### Daily Suggestions

```typescript
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function DailySuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await api.getSuggestions();
      setSuggestions(data);
    }
    load();
  }, []);

  return (
    <div>
      <h2>Daily Suggestions</h2>
      <ul>
        {suggestions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Type Safety

Generate TypeScript types from Zod schemas or use the following interfaces:

```typescript
// types/api.ts
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
  type: 'workout' | 'sleep' | 'mood' | 'hydration' | 'steps' | 'custom';
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
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
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
```

## Testing

```bash
# Start backend
cd backend && npm run dev

# Start frontend (in another terminal)
cd "Fitter Wellness App Design" && npm run dev

# Backend: http://localhost:4000
# Frontend: http://localhost:3000
```

---

Now your frontend can seamlessly communicate with the production-ready backend! 🚀
