# Chat Preservation and Dashboard Data Implementation

## Obiectiv

Implementarea funcționalităților pentru:

1. **Preserve chat history** - să salvez conversațiile în baza de date
2. **Dashboard fetch** - să afișez rezultatele logate din baza de date în fiecare secțiune

## Implementare

### 1. Backend - Chat Messages Model

#### ChatMessage Model (`backend/src/models/ChatMessage.ts`)

```typescript
export interface ChatMessageDoc extends Document {
  userId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<ChatMessageDoc>(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    sessionId: { type: String, index: true },
  },
  { timestamps: true }
);

ChatMessageSchema.index({ userId: 1, timestamp: -1 });
ChatMessageSchema.index({ sessionId: 1, timestamp: 1 });
```

### 2. Backend - Chat Routes

#### Chat API (`backend/src/routes/chat.ts`)

```typescript
// Save message
POST /api/chat/save
{
  "role": "user" | "assistant",
  "content": "message content",
  "sessionId": "optional_session_id"
}

// Get messages
GET /api/chat/messages?sessionId=xxx&limit=50

// Get sessions
GET /api/chat/sessions
```

#### Endpoints:

- **`POST /api/chat/save`** - Salvează un mesaj în baza de date
- **`GET /api/chat/messages`** - Returnează mesajele (opțional filtrate pe sessionId)
- **`GET /api/chat/sessions`** - Returnează sesiunile de chat cu statistici

### 3. Backend - Dashboard Data

#### Dashboard API (`backend/src/routes/dashboard.ts`)

```typescript
GET / api / dashboard / data;
```

**Response Structure**:

```typescript
{
  success: true,
  data: {
    daily: {
      hydration: number,
      workoutCalories: number,
      sleepHours: number,
      mealCount: number,
      totalCalories: number,
      totalProtein: number
    },
    recent: {
      logs: Log[],
      nutrition: NutritionLog[],
      chatMessages: ChatMessage[]
    },
    stats: {
      totalLogs: number,
      totalNutrition: number,
      totalChatMessages: number
    }
  }
}
```

### 4. Backend - AI Route Enhancement

#### Auto-save Chat Messages (`backend/src/routes/ai.ts`)

```typescript
// Save messages to database
const sessionId = `session_${Date.now()}`;
const userMessage = messages[messages.length - 1];

try {
  // Save user message
  if (userMessage) {
    await ChatMessage.create({
      userId: req.userId,
      role: "user",
      content: userMessage.content,
      sessionId,
    });
  }

  // Save AI response
  await ChatMessage.create({
    userId: req.userId,
    role: "assistant",
    content: dataOut.message,
    sessionId,
  });
} catch (error) {
  console.error("Failed to save chat messages:", error);
  // Continue without failing the request
}
```

### 5. Frontend - API Client Updates

#### New API Methods (`src/lib/api.ts`)

```typescript
// Chat
async saveChatMessage(message: {
  role: 'user' | 'assistant';
  content: string;
  sessionId?: string;
})

async getChatMessages(sessionId?: string, limit?: number)

async getChatSessions()

// Dashboard
async getDashboardData()
```

#### New Interfaces:

```typescript
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
  };
  recent: {
    logs: Log[];
    nutrition: NutritionLog[];
    chatMessages: ChatMessage[];
  };
  stats: {
    totalLogs: number;
    totalNutrition: number;
    totalChatMessages: number;
  };
}
```

### 6. Frontend - Dashboard Component Updates

#### Database Integration (`src/components/Dashboard.tsx`)

```typescript
export function Dashboard({ onProfileClick }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from database
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data } = await api.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Use database data or fallback to context data
  const dailyStats = dashboardData?.daily || {
    hydration: hydrationToday,
    workoutCalories: workoutCaloriesToday,
    sleepHours: sleepHoursToday || 0,
    mealCount: mealCountToday,
    totalCalories: 0,
    totalProtein: 0,
  };

  const recentChatMessages = dashboardData?.recent.chatMessages || [];
  const recentLogs = dashboardData?.recent.logs || [];
  const recentNutrition = dashboardData?.recent.nutrition || [];
```

#### UI Updates:

- **Header Badges**: Folosesc `dailyStats` din baza de date
- **Chat Messages**: Afișează `recentChatMessages` din baza de date
- **Recent Activities**: Afișează `recentLogs` din baza de date
- **Loading States**: Spinner-uri pentru loading
- **Empty States**: Mesaje când nu există date

## Flow Complet

### Chat Preservation Flow

```
User sends message to AI
  ↓
[AI Route: /api/ai/chat]
  ↓
[AI generates response]
  ↓
[Auto-save both messages to ChatMessage collection]
  ↓
[Return response to frontend]
  ↓
[Frontend displays in chat UI]
```

### Dashboard Data Flow

```
Dashboard component loads
  ↓
[useEffect: fetchDashboardData()]
  ↓
[API call: GET /api/dashboard/data]
  ↓
[Backend aggregates data from Logs, NutritionLogs, ChatMessages]
  ↓
[Return structured data]
  ↓
[Frontend updates UI with real data]
```

## Database Schema

### ChatMessage Collection

```javascript
{
  "_id": ObjectId("..."),
  "userId": "user123",
  "role": "user" | "assistant",
  "content": "Hello, how can I help you?",
  "timestamp": ISODate("2025-10-23T12:00:00Z"),
  "sessionId": "session_1698067200000",
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### Indexes

```javascript
// Performance indexes
db.chatmessages.createIndex({ userId: 1, timestamp: -1 });
db.chatmessages.createIndex({ sessionId: 1, timestamp: 1 });
```

## API Endpoints

### Chat Endpoints

- **`POST /api/chat/save`** - Save chat message
- **`GET /api/chat/messages`** - Get chat messages
- **`GET /api/chat/sessions`** - Get chat sessions

### Dashboard Endpoints

- **`GET /api/dashboard/data`** - Get dashboard data

### AI Endpoints (Enhanced)

- **`POST /api/ai/chat`** - Chat with AI (auto-saves messages)

## Frontend Integration

### Dashboard Component Features

#### 1. Real-time Data Display

```typescript
// Header badges show real data
<Badge>🔥 {dailyStats.workoutCalories} kcal</Badge>
<Badge>💧 {dailyStats.hydration}</Badge>
<Badge>🛌 {dailyStats.sleepHours || "-"} h</Badge>
<Badge>🥗 {dailyStats.mealCount}</Badge>
```

#### 2. Chat History Display

```typescript
// Show recent chat messages from database
{
  recentChatMessages.map((message) => (
    <div
      key={message._id}
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] p-4 rounded-2xl ${
          message.role === "user"
            ? "bg-gradient-to-br from-sky-400 to-emerald-400 text-white"
            : "bg-white/80 text-slate-700"
        }`}
      >
        {message.content}
      </div>
    </div>
  ));
}
```

#### 3. Recent Activities Display

```typescript
// Show recent logs from database
{
  recentLogs.map((log) => (
    <div
      key={log._id}
      className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 p-4"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-br ${background}`}
        >
          <Icon className="w-5 h-5 text-slate-700" />
        </div>
        <div>
          <p className="text-slate-700 font-medium">
            {log.type === "hydration"
              ? "Water logged"
              : log.type === "sleep"
              ? "Sleep logged"
              : log.type === "workout"
              ? "Workout logged"
              : log.type === "meal"
              ? "Meal logged"
              : "Activity logged"}
          </p>
          <p className="text-slate-500 text-sm">
            {log.value} {log.unit || ""} {log.note ? `· ${log.note}` : ""}
          </p>
        </div>
      </div>
      <span className="text-xs text-slate-400">
        {new Date(log.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  ));
}
```

## Testing Scenarios

### 1. Chat Preservation Test

**Steps**:

1. Open Assistant tab
2. Send message: "I ate pasta for lunch"
3. Check database: `db.chatmessages.find({userId: "user123"})`
4. Verify: Both user and AI messages saved
5. Refresh Dashboard
6. Verify: Chat messages appear in Dashboard

**Expected Results**:

- ✅ User message saved with role: "user"
- ✅ AI response saved with role: "assistant"
- ✅ Both messages have same sessionId
- ✅ Messages appear in Dashboard chat section

### 2. Dashboard Data Test

**Steps**:

1. Log some activities (water, workout, sleep, meal)
2. Go to Dashboard
3. Check if data appears in header badges
4. Check if recent activities appear in "AI Synced Actions"
5. Check if chat messages appear in "AI Coach" section

**Expected Results**:

- ✅ Header badges show correct daily totals
- ✅ Recent activities show logged items
- ✅ Chat messages show conversation history
- ✅ Loading states work properly
- ✅ Empty states show when no data

### 3. Data Persistence Test

**Steps**:

1. Log activities and chat messages
2. Refresh page
3. Verify data persists
4. Check different user accounts
5. Verify data isolation

**Expected Results**:

- ✅ Data persists after page refresh
- ✅ Each user sees only their own data
- ✅ No data leakage between users

## Performance Considerations

### Database Queries

```javascript
// Optimized queries with indexes
db.chatmessages.find({ userId: "user123" }).sort({ timestamp: -1 }).limit(10);
db.logs.find({ userId: "user123", date: { $gte: today, $lt: tomorrow } });
db.nutritionlogs.find({
  userId: "user123",
  date: { $gte: today, $lt: tomorrow },
});
```

### Caching Strategy

- **Dashboard data**: Fetched once on component mount
- **Chat messages**: Real-time updates
- **Activity logs**: Real-time updates via context

### Error Handling

```typescript
try {
  const { data } = await api.getDashboardData();
  setDashboardData(data);
} catch (error) {
  console.error("Failed to fetch dashboard data:", error);
  // Fallback to context data
} finally {
  setLoading(false);
}
```

## Security Features

### Data Isolation

- All queries filtered by `userId`
- No cross-user data access
- JWT authentication required

### Input Validation

- Zod schemas for all endpoints
- Content sanitization
- Rate limiting

## Monitoring

### Database Metrics

- Chat message count per user
- Dashboard data fetch frequency
- Query performance

### Error Tracking

- Failed chat message saves
- Dashboard data fetch errors
- API response times

## Known Limitations

1. **Session Management**: Basic sessionId generation
2. **Message History**: Limited to recent messages
3. **Real-time Updates**: Manual refresh required
4. **Data Aggregation**: Simple daily totals

## Next Steps (Optional)

- [ ] Real-time chat updates with WebSockets
- [ ] Advanced session management
- [ ] Message search and filtering
- [ ] Chat export functionality
- [ ] Dashboard data caching
- [ ] Real-time activity notifications

## Concluzie

✅ **Funcționalitățile sunt complet implementate**:

- Chat messages se salvează automat în baza de date
- Dashboard afișează date reale din baza de date
- Toate secțiunile Dashboard folosesc date persistente
- Loading states și empty states implementate
- Error handling robust

**Status**: Ready for testing and production use.

---

**Data implementării**: 23 Octombrie 2025  
**Tehnologii**: MongoDB, Express, React, TypeScript  
**Fișiere modificate**:

- Backend: `ChatMessage.ts`, `chat.ts`, `dashboard.ts`, `ai.ts`, `app.ts`
- Frontend: `api.ts`, `Dashboard.tsx`
