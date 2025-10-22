# Frontend-Backend Integration Guide

## ✅ What Was Integrated

The Fitter Wellness App frontend has been successfully integrated with the production-ready backend API.

### 1. **API Client Layer** (`src/lib/api.ts`)

- TypeScript API client with full type safety
- Token-based authentication (JWT)
- Auto-persists auth tokens to localStorage
- Comprehensive methods for all backend endpoints:
  - Auth: register, login, getMe
  - Profile: getProfile, updateProfile
  - Logs: getLogs, createLog
  - Nutrition: logMeal, getNutritionLogs
  - AI: chat (OpenAI integration)
  - Insights: getSuggestions, getInsights, refreshInsights

### 2. **AI Assistant Page** (Real-time AI Chat)

**File**: `src/components/AssistantPage.tsx`

**Integrated Features**:

- ✅ Real-time chat with OpenAI API via backend
- ✅ Conversation history context (last 6 messages)
- ✅ Quick action buttons populate prompts
- ✅ Auto-scroll to latest message
- ✅ Error handling with fallback messages
- ✅ Toast notifications for errors
- ✅ Typing indicator during AI processing

**How it works**:

```typescript
// User sends message
const { data } = await api.chat([...conversationHistory, newMessage]);
// Backend calls OpenAI and returns AI response
// Response displayed in chat UI
```

### 3. **Daily Recommendations** (AI-Powered Suggestions)

**File**: `src/components/DailyRecommendations.tsx`

**Integrated Features**:

- ✅ Fetches personalized suggestions from backend on mount
- ✅ Backend analyzes user's recent logs (workout, sleep, nutrition)
- ✅ Transforms plain text suggestions into beautiful card UI
- ✅ Smart categorization based on keywords (Sleep, Hydration, Recovery, Nutrition)
- ✅ Loading states with spinner
- ✅ Error handling with toast notifications
- ✅ Dynamic emoji and gradient styling per category

**How it works**:

```typescript
// On component mount
const { data } = await api.getSuggestions();
// Backend returns: ["Plan a 20–30 minute light workout today.", "Aim for at least 7 hours of sleep..."]
// Frontend transforms into styled recommendation cards
```

### 4. **Vite Proxy Configuration**

**File**: `vite.config.ts`

Added proxy to forward `/api/*` requests to backend:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:4000',
    changeOrigin: true,
    secure: false,
  },
}
```

This allows the frontend to call `/api/chat` which proxies to `http://localhost:4000/api/chat`.

### 5. **Toast Notifications**

**File**: `src/main.tsx`

Added Sonner toast provider for user feedback:

```typescript
<Toaster richColors position="top-right" />
```

### 6. **Environment Configuration**

**File**: `src/vite-env.d.ts`

TypeScript types for environment variables:

```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}
```

---

## 🚀 How to Run

### Step 1: Start the Backend

```bash
cd backend
npm install  # If not already installed
npm run dev  # Starts on http://localhost:4000
```

**Required Environment Variables** (create `backend/.env`):

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/fitter
JWT_SECRET=your-secret-at-least-32-chars-long
OPENAI_API_KEY=sk-proj-...
LOG_LEVEL=info
```

### Step 2: Start the Frontend

```bash
cd "Fitter Wellness App Design"
npm install  # If not already installed
npm run dev  # Starts on http://localhost:3000
```

**Optional Environment Variables** (create `Fitter Wellness App Design/.env`):

```env
VITE_API_URL=http://localhost:4000/api
```

### Step 3: Test the Integration

1. **Open Browser**: Navigate to `http://localhost:3000`
2. **Try AI Assistant**:
   - Click "Try App" or "Get Started"
   - Navigate to AI Assistant (bottom nav)
   - Click a quick action button or type a question
   - Wait for OpenAI response (1-3 seconds)
3. **Test Daily Recommendations**:
   - Navigate to Dashboard
   - Scroll to "Daily Suggestions" section
   - Backend suggestions load automatically
   - Click "I'll do it" or "Dismiss" on cards

---

## 🎯 API Integration Status

| Component                 | Backend Endpoint          | Status               |
| ------------------------- | ------------------------- | -------------------- |
| **AI Assistant**          | `POST /api/ai/chat`       | ✅ Fully Integrated  |
| **Daily Recommendations** | `GET /api/suggestions`    | ✅ Fully Integrated  |
| Nutrition Recommender     | `GET /api/nutrition/list` | 🟡 Ready (not wired) |
| Progress Insights         | `GET /api/insights`       | 🟡 Ready (not wired) |
| Meal Log Form             | `POST /api/nutrition/log` | 🟡 Ready (not wired) |
| History Page              | `GET /api/logs`           | 🟡 Ready (not wired) |
| Profile Page              | `GET/PUT /api/profile`    | 🟡 Ready (not wired) |
| Onboarding Form           | `POST /api/auth/register` | 🟡 Ready (not wired) |

---

## 📊 Data Flow Examples

### Example 1: AI Chat Flow

```
User Types: "Help me sleep better"
    ↓
Frontend: AssistantPage.tsx
    ↓
API Client: api.chat(messages)
    ↓
Backend: POST /api/ai/chat
    ↓
OpenAI API: GPT-4o-mini processes request
    ↓
Backend: Returns { success: true, data: { reply: "..." } }
    ↓
Frontend: Displays AI response in chat
```

### Example 2: Daily Suggestions Flow

```
User Opens Dashboard
    ↓
Frontend: DailyRecommendations.tsx useEffect()
    ↓
API Client: api.getSuggestions()
    ↓
Backend: GET /api/suggestions
    ↓
Backend: Analyzes recent workout/sleep/nutrition logs
    ↓
Backend: Returns ["Suggestion 1", "Suggestion 2", ...]
    ↓
Frontend: Transforms to styled cards with emojis/gradients
```

---

## 🔧 Next Integration Steps

### Priority 1: Authentication Flow

**Files to Update**:

- `src/App.tsx` - Add login/register state
- `src/components/OnboardingForm.tsx` - Wire to `POST /api/auth/register`

**Implementation**:

```typescript
// In OnboardingForm.tsx
const handleSubmit = async (data) => {
  await api.register(email, password, name);
  onComplete(); // Redirect to dashboard
};
```

### Priority 2: Nutrition Logging

**Files to Update**:

- `src/components/MealLogForm.tsx` - Wire to `POST /api/nutrition/log`

**Implementation**:

```typescript
const handleLogMeal = async (meal) => {
  await api.logMeal({
    date: new Date().toISOString(),
    mealType: "lunch",
    items: meal.items,
  });
  toast.success("Meal logged!");
};
```

### Priority 3: History Page

**Files to Update**:

- `src/components/HistoryPage.tsx` - Wire to `GET /api/logs`

**Implementation**:

```typescript
useEffect(() => {
  const fetchLogs = async () => {
    const { data } = await api.getLogs({ limit: 50 });
    setLogs(data);
  };
  fetchLogs();
}, []);
```

### Priority 4: Progress Insights

**Files to Update**:

- `src/components/ProgressInsights.tsx` - Wire to `GET /api/insights`

**Implementation**:

```typescript
useEffect(() => {
  const fetchInsights = async () => {
    const { data } = await api.getInsights(); // 14-day summaries
    setInsights(data);
  };
  fetchInsights();
}, []);
```

---

## 🐛 Troubleshooting

### Issue: "Failed to get AI response"

**Cause**: Backend not running or OpenAI API key invalid
**Fix**:

1. Check backend is running on port 4000
2. Verify `OPENAI_API_KEY` in `backend/.env`
3. Check backend logs for errors

### Issue: "Failed to load recommendations"

**Cause**: Backend not authenticated or MongoDB not connected
**Fix**:

1. Check MongoDB is running (`mongod`)
2. Verify `MONGO_URI` in `backend/.env`
3. Check backend logs: `npm run dev` in backend folder

### Issue: CORS errors

**Cause**: Frontend calling backend directly without proxy
**Fix**:

1. Ensure Vite proxy is configured in `vite.config.ts`
2. Use relative URLs: `/api/chat` not `http://localhost:4000/api/chat`
3. Restart frontend dev server

### Issue: TypeScript errors

**Cause**: Missing types or incorrect imports
**Fix**:

```bash
cd "Fitter Wellness App Design"
npm install --save-dev @types/node
```

---

## 📝 Code Examples

### How to Add New Backend Integration

**Step 1**: Add method to `src/lib/api.ts`

```typescript
async getWorkoutPlan() {
  return this.request<{ success: boolean; data: WorkoutPlan }>('/workouts/plan');
}
```

**Step 2**: Use in component

```typescript
import { api } from "../lib/api";
import { toast } from "sonner";

function WorkoutPage() {
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    async function loadPlan() {
      try {
        const { data } = await api.getWorkoutPlan();
        setPlan(data);
      } catch (error) {
        toast.error("Failed to load workout plan");
      }
    }
    loadPlan();
  }, []);

  return <div>{plan && <PlanDisplay plan={plan} />}</div>;
}
```

---

## ✅ Testing Checklist

- [x] Backend compiles and runs without errors
- [x] Frontend compiles and runs without errors
- [x] AI Assistant sends messages and receives responses
- [x] Daily Recommendations loads suggestions from backend
- [x] Toast notifications appear on errors
- [x] Proxy routes `/api/*` to backend correctly
- [ ] User registration and login
- [ ] Meal logging
- [ ] Activity tracking
- [ ] Progress insights display

---

## 🎉 Summary

**What Works Now**:

- ✅ Real-time AI chat with OpenAI via backend
- ✅ AI-powered daily suggestions
- ✅ Automatic suggestion categorization
- ✅ Error handling and user feedback
- ✅ Proxy configuration for seamless API calls

**Ready to Wire** (API methods exist, just need UI hookup):

- 🟡 Auth (register/login)
- 🟡 Profile management
- 🟡 Nutrition logging
- 🟡 Activity logs
- 🟡 14-day insights

The foundation is complete! All backend endpoints are production-ready and the frontend has a robust API client. Continue wiring remaining components following the patterns established in AssistantPage and DailyRecommendations.

---

**Questions?** Check:

- Backend docs: `/backend/IMPLEMENTATION.md`
- API client: `/Fitter Wellness App Design/src/lib/api.ts`
- Integration examples: This file! 🚀
