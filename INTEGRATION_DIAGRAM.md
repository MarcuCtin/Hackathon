# 🏗️ Fitter - System Architecture & Integration Diagram

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React + Vite)                     │
│                         Port 3000 - localhost                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ /api/* → Proxy
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                      BACKEND (Node + Express + TS)                   │
│                         Port 4000 - localhost                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │   MongoDB    │   │  OpenAI API  │   │  Node Cron   │
    │   Database   │   │  GPT-4o-mini │   │   Daily Job  │
    │   Port 27017 │   │              │   │              │
    └──────────────┘   └──────────────┘   └──────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. User Registration Flow

```
OnboardingForm.tsx
    │
    │ 1. User fills form (name, email, password)
    │
    ▼
api.register(email, password, name)
    │
    │ 2. POST /api/auth/register
    │    Body: { email, password, name }
    │
    ▼
Backend: authRoutes
    │
    │ 3. Hash password (bcrypt, 10 rounds)
    │ 4. Create User in MongoDB
    │ 5. Generate JWT token (7-day expiry)
    │
    ▼
Frontend: api.ts
    │
    │ 6. Store token in localStorage
    │ 7. Set token in api client headers
    │
    ▼
OnboardingForm.tsx
    │
    │ 8. Show success toast
    │ 9. Navigate to wellness questions
    │ 10. Auto-save goals to profile
    │
    ▼
✅ User Registered & Authenticated
```

---

### 2. AI Chat Flow

```
AssistantPage.tsx
    │
    │ 1. User types message: "Help me sleep better"
    │ 2. Add to conversation history (max 6 messages)
    │
    ▼
api.chat(messages)
    │
    │ 3. POST /api/ai/chat
    │    Headers: { Authorization: Bearer <token> }
    │    Body: { messages: [{role, content}...] }
    │
    ▼
Backend: aiRoutes → openaiService
    │
    │ 4. Add system prompt (wellness coach persona)
    │ 5. Call OpenAI API
    │    Model: gpt-4o-mini
    │    Temperature: 0.7
    │    Max tokens: 500
    │
    ▼
OpenAI API
    │
    │ 6. Process prompt with context
    │ 7. Generate wellness response
    │
    ▼
Backend: Response
    │
    │ 8. Return { success: true, data: { reply: "..." } }
    │
    ▼
Frontend: AssistantPage.tsx
    │
    │ 9. Add AI reply to chat history
    │ 10. Animate message appearance
    │ 11. Auto-scroll to bottom
    │
    ▼
✅ AI Chat Complete
```

---

### 3. Daily Suggestions Flow

```
Dashboard → DailyRecommendations.tsx
    │
    │ 1. Component mounts
    │
    ▼
useEffect → api.getSuggestions()
    │
    │ 2. GET /api/suggestions
    │    Headers: { Authorization: Bearer <token> }
    │
    ▼
Backend: suggestionsRoutes → suggestionsService
    │
    │ 3. Query user's recent logs (last 7 days)
    │    - Workout logs (activity, duration)
    │    - Sleep logs (hours)
    │    - Nutrition logs (calories, protein)
    │
    ▼
MongoDB
    │
    │ 4. Aggregate data
    │    - Avg sleep: 6.2 hours
    │    - Workout frequency: 3x/week
    │    - Avg protein: 55g/day
    │
    ▼
Backend: Suggestion Engine
    │
    │ 5. Apply pattern recognition rules:
    │    - Sleep < 7h → "Try to sleep 30 min earlier"
    │    - Protein < 60g → "Increase protein intake"
    │    - Workouts < 4x/week → "Add one more workout"
    │
    ▼
Backend: Response
    │
    │ 6. Return { success: true, data: ["suggestion 1", ...] }
    │
    ▼
Frontend: DailyRecommendations.tsx
    │
    │ 7. Categorize suggestions (Sleep, Hydration, etc.)
    │ 8. Render animated cards with gradients
    │ 9. Add priority indicators
    │
    ▼
✅ Personalized Suggestions Displayed
```

---

### 4. Profile Management Flow

```
ProfilePage.tsx
    │
    │ 1. Component mounts → Show spinner
    │
    ▼
useEffect → api.getProfile()
    │
    │ 2. GET /api/profile
    │    Headers: { Authorization: Bearer <token> }
    │
    ▼
Backend: profileRoutes
    │
    │ 3. req.userId from JWT (auth middleware)
    │ 4. Query User.findById(userId)
    │
    ▼
MongoDB
    │
    │ 5. Return user document
    │    { _id, email, name, age, heightCm, weightKg, goals, ... }
    │
    ▼
Frontend: ProfilePage.tsx
    │
    │ 6. Populate form fields
    │ 7. Hide spinner
    │
    ▼
User Edits Fields
    │
    │ 8. Change name, age, height, weight, goals
    │ 9. Click "Save Changes"
    │
    ▼
api.updateProfile(updates)
    │
    │ 10. PUT /api/profile
    │     Headers: { Authorization: Bearer <token> }
    │     Body: { name, age, heightCm, weightKg, goals }
    │
    ▼
Backend: profileRoutes
    │
    │ 11. Validate input (Zod schema)
    │ 12. User.findByIdAndUpdate(userId, updates)
    │
    ▼
MongoDB
    │
    │ 13. Update user document
    │ 14. Return updated user
    │
    ▼
Frontend: ProfilePage.tsx
    │
    │ 15. Show success toast
    │ 16. Exit edit mode
    │
    ▼
✅ Profile Saved
```

---

## 🗂️ Component → API Mapping

### ✅ Fully Integrated Components

| Frontend Component           | API Client Method      | Backend Endpoint          | What It Does              |
| ---------------------------- | ---------------------- | ------------------------- | ------------------------- |
| **OnboardingForm.tsx**       | `api.register()`       | `POST /api/auth/register` | Create user account + JWT |
|                              | `api.updateProfile()`  | `PUT /api/profile`        | Save wellness goals       |
| **AssistantPage.tsx**        | `api.chat()`           | `POST /api/ai/chat`       | AI chat via OpenAI        |
| **DailyRecommendations.tsx** | `api.getSuggestions()` | `GET /api/suggestions`    | Personalized suggestions  |
| **ProfilePage.tsx**          | `api.getProfile()`     | `GET /api/profile`        | Load user data            |
|                              | `api.updateProfile()`  | `PUT /api/profile`        | Save profile changes      |

### 🟡 Ready to Wire Components

| Frontend Component       | API Client Method        | Backend Endpoint          | What It Does             |
| ------------------------ | ------------------------ | ------------------------- | ------------------------ |
| **MealLogForm.tsx**      | `api.logMeal()`          | `POST /api/nutrition/log` | Log meals with nutrition |
| **HistoryPage.tsx**      | `api.getLogs()`          | `GET /api/logs`           | View activity history    |
| **ProgressInsights.tsx** | `api.getInsights()`      | `GET /api/insights`       | 14-day summaries         |
| **NutritionPage.tsx**    | `api.getNutritionLogs()` | `GET /api/nutrition/list` | View nutrition logs      |

---

## 📦 File Structure

```
/Hackathon
│
├── backend/                           ✅ COMPLETE
│   ├── src/
│   │   ├── index.ts                  # Server entry point
│   │   ├── app.ts                    # Express app setup
│   │   ├── config/
│   │   │   ├── env.ts                # Environment config (Zod)
│   │   │   └── logger.ts             # Pino logger
│   │   ├── db/
│   │   │   └── mongoose.ts           # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.ts               # User schema + auth
│   │   │   ├── Log.ts                # Activity logs
│   │   │   ├── NutritionLog.ts       # Meal logs
│   │   │   └── DailySummary.ts       # Aggregated insights
│   │   ├── routes/
│   │   │   ├── auth.ts               # Register, login, /me
│   │   │   ├── profile.ts            # GET/PUT profile
│   │   │   ├── logs.ts               # CRUD activity logs
│   │   │   ├── nutrition.ts          # Log meals, list nutrition
│   │   │   ├── ai.ts                 # Chat with OpenAI
│   │   │   ├── suggestions.ts        # AI suggestions
│   │   │   └── insights.ts           # 14-day summaries
│   │   ├── services/
│   │   │   ├── openai.ts             # OpenAI integration
│   │   │   ├── suggestions.ts        # Pattern recognition
│   │   │   └── insights.ts           # Data aggregation
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT verification
│   │   │   ├── errorHandler.ts       # Global error handler
│   │   │   └── validate.ts           # Zod validation
│   │   ├── utils/
│   │   │   ├── jwt.ts                # Sign/verify tokens
│   │   │   └── errors.ts             # Custom error classes
│   │   └── cron/
│   │       └── daily.ts              # Daily summary job
│   ├── Dockerfile                    # Container setup
│   ├── docker-compose.yml            # Mongo + API orchestration
│   ├── package.json                  # Dependencies
│   └── tsconfig.json                 # TypeScript config
│
└── Fitter Wellness App Design/       ✅ INTEGRATED
    ├── src/
    │   ├── main.tsx                  # App entry + toast provider
    │   ├── App.tsx                   # Main app component
    │   ├── lib/
    │   │   └── api.ts                # ✅ API client (all methods)
    │   ├── hooks/
    │   │   └── useAuth.ts            # ✅ Auth context (ready)
    │   ├── components/
    │   │   ├── OnboardingForm.tsx    # ✅ Auth + registration
    │   │   ├── AssistantPage.tsx     # ✅ AI chat
    │   │   ├── DailyRecommendations.tsx # ✅ Suggestions
    │   │   ├── ProfilePage.tsx       # ✅ Profile load/save
    │   │   ├── MealLogForm.tsx       # 🟡 Ready to wire
    │   │   ├── HistoryPage.tsx       # 🟡 Ready to wire
    │   │   ├── ProgressInsights.tsx  # 🟡 Ready to wire
    │   │   └── NutritionPage.tsx     # 🟡 Ready to wire
    │   └── vite-env.d.ts             # Environment types
    ├── vite.config.ts                # ✅ API proxy configured
    └── package.json                  # Dependencies
```

---

## 🔐 Authentication Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        User Session Lifecycle                   │
└────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   User → OnboardingForm → api.register() → Backend
       ↓
   Hash password (bcrypt)
       ↓
   Save to MongoDB
       ↓
   Generate JWT (7-day expiry)
       ↓
   Return { token: "eyJhbGc..." }
       ↓
   Store in localStorage
       ↓
   ✅ Authenticated

2. SUBSEQUENT REQUESTS
   Any Component → api.someMethod()
       ↓
   api.ts reads token from localStorage
       ↓
   Adds header: Authorization: Bearer <token>
       ↓
   Backend auth middleware verifies JWT
       ↓
   Extracts userId from token payload
       ↓
   Attaches req.userId
       ↓
   Route handler uses req.userId
       ↓
   ✅ Authorized

3. TOKEN EXPIRY
   Request fails (401 Unauthorized)
       ↓
   Frontend detects error
       ↓
   api.clearToken()
       ↓
   Redirect to login
       ↓
   User re-authenticates
```

---

## 🧠 AI Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI-Powered Features Stack                     │
└─────────────────────────────────────────────────────────────────┘

Frontend
    │
    ├── AssistantPage.tsx
    │   └── Real-time chat with GPT-4o-mini
    │       - User types question
    │       - Maintains conversation history
    │       - Auto-scroll, typing indicators
    │
    ├── DailyRecommendations.tsx
    │   └── Pattern recognition suggestions
    │       - Fetches from backend on mount
    │       - Categorizes by type (Sleep, Hydration, etc.)
    │       - Animated cards with priority
    │
    └── ProgressInsights.tsx (ready to wire)
        └── 14-day trend analysis
            - Weekly summaries
            - Goal progress
            - Health metrics

Backend
    │
    ├── OpenAI Service (services/openai.ts)
    │   └── Chat completion with context
    │       Model: gpt-4o-mini
    │       Temperature: 0.7
    │       Max tokens: 500
    │       System prompt: "You are a wellness coach..."
    │
    ├── Suggestion Engine (services/suggestions.ts)
    │   └── Pattern recognition from logs
    │       - Query last 7 days of data
    │       - Analyze sleep duration
    │       - Check workout frequency
    │       - Assess nutrition (protein, calories)
    │       - Generate text suggestions
    │
    └── Insights Service (services/insights.ts)
        └── Aggregation & summarization
            - Group logs by day
            - Calculate averages
            - Identify trends
            - Store in DailySummary collection

Database (MongoDB)
    │
    ├── logs (activity, workout, sleep)
    ├── nutritionLogs (meals with nutrition)
    └── dailySummaries (aggregated insights)

External API
    │
    └── OpenAI API
        └── GPT-4o-mini endpoints
```

---

## 🚀 Request/Response Examples

### Example 1: Register User

**Request:**

```http
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "email": "alex@example.com",
  "password": "SecurePass123",
  "name": "Alex Thompson"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Example 2: AI Chat

**Request:**

```http
POST http://localhost:4000/api/ai/chat
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Help me sleep better" }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "reply": "I'd recommend establishing a consistent sleep schedule. Try going to bed and waking up at the same time every day. Also, avoid screens 1 hour before bed and keep your bedroom cool (65-68°F). Would you like specific relaxation techniques?"
  }
}
```

---

### Example 3: Get Suggestions

**Request:**

```http
GET http://localhost:4000/api/suggestions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "success": true,
  "data": [
    "You're averaging 6.2 hours of sleep. Try to sleep 30 minutes earlier tonight.",
    "Your protein intake is 55g/day. Consider adding 10-15g more protein.",
    "You've worked out 3 times this week. Add one more session for optimal results.",
    "You're staying well hydrated! Keep up the good work."
  ]
}
```

---

### Example 4: Update Profile

**Request:**

```http
PUT http://localhost:4000/api/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Alex Thompson",
  "age": 28,
  "heightCm": 175,
  "weightKg": 75,
  "goals": ["Weight Loss", "Better Sleep", "More Energy"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "alex@example.com",
    "name": "Alex Thompson",
    "age": 28,
    "heightCm": 175,
    "weightKg": 75,
    "goals": ["Weight Loss", "Better Sleep", "More Energy"],
    "createdAt": "2025-10-22T10:00:00.000Z"
  }
}
```

---

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                   Security Architecture                      │
└─────────────────────────────────────────────────────────────┘

1. Authentication Layer
   ├── JWT tokens (HS256 algorithm)
   ├── 7-day expiry
   ├── Bcrypt password hashing (10 rounds)
   └── Token stored in localStorage (not cookies)

2. Authorization Middleware
   ├── Verifies JWT signature
   ├── Checks token expiry
   ├── Extracts userId from payload
   └── Attaches to req.userId

3. Input Validation
   ├── Zod schemas on all routes
   ├── Type-safe validation
   ├── Custom error messages
   └── Automatic sanitization

4. Rate Limiting
   ├── 100 requests per 15 minutes per IP
   ├── Applied globally
   └── Prevents brute force attacks

5. Security Headers (Helmet)
   ├── Content-Security-Policy
   ├── X-Frame-Options
   ├── X-Content-Type-Options
   └── Strict-Transport-Security

6. CORS Configuration
   ├── Whitelisted origins only
   ├── Credentials allowed
   └── Preflight caching

7. MongoDB Security
   ├── Connection string in .env
   ├── No direct client exposure
   └── Mongoose schema validation
```

---

## 📊 Performance Optimizations

```
Frontend
├── Vite HMR (instant updates)
├── React lazy loading (code splitting)
├── Debounced search inputs
├── Optimistic UI updates
└── Cached API responses

Backend
├── MongoDB indexes on userId, date
├── Async/await throughout
├── Compression middleware (gzip)
├── Limited query results (pagination)
└── Pino logger (fast JSON logging)

API
├── JWT validation cached
├── OpenAI streaming (future enhancement)
├── Rate limiting per IP
└── Connection pooling (MongoDB)
```

---

## 🎨 UI/UX Integration

```
Component Patterns
├── Loading States
│   └── <Loader2 className="animate-spin" />
│
├── Error Handling
│   └── toast.error("Failed to load")
│
├── Success Feedback
│   └── toast.success("Saved!")
│
├── Animated Transitions
│   └── motion.div with framer-motion
│
├── Gradient Cards
│   └── from-sky-400 to-emerald-400
│
└── Glass Morphism
    └── bg-white/80 backdrop-blur-xl
```

---

## 🔄 Real-Time Features

Currently implemented:

- ✅ Real-time AI chat responses
- ✅ Auto-scroll in chat
- ✅ Typing indicators
- ✅ Instant toast notifications

Future enhancements:

- 🔮 WebSocket for live updates
- 🔮 Push notifications
- 🔮 Real-time collaboration
- 🔮 Live dashboard widgets

---

## 📈 Scalability Considerations

Current architecture supports:

- ✅ Horizontal scaling (stateless backend)
- ✅ Load balancing ready (no in-memory state)
- ✅ Database indexing for performance
- ✅ Rate limiting to prevent abuse
- ✅ Containerized deployment (Docker)

Future optimizations:

- 🔮 Redis caching layer
- 🔮 CDN for static assets
- 🔮 Database sharding
- 🔮 Microservices architecture
- 🔮 Kubernetes orchestration

---

**Questions about the architecture?** Check `/backend/IMPLEMENTATION.md` for detailed backend docs!
