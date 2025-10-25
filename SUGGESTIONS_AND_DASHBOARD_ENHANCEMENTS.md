# AI Suggestions & Dashboard Enhancements

## Overview

Sistemul de sugestii AI și îmbunătățirile dashboard-ului pentru Fitter Wellness App, implementat cu Google Gemini 1.5 Flash și MongoDB.

## Funcționalități Implementate

### 1. AI Suggestions System

#### Model Suggestion

```typescript
interface Suggestion {
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
  generatedAt: Date;
  expiresAt?: Date;
  completedAt?: Date;
  dismissedAt?: Date;
}
```

#### API Endpoints

**GET /api/suggestions**

- Returnează sugestiile active ale utilizatorului
- Sortate după prioritate și data creării

**POST /api/suggestions/:id/complete**

- Marchează o sugestie ca fiind completată
- Actualizează `status` și `completedAt`

**POST /api/suggestions/:id/dismiss**

- Marchează o sugestie ca fiind respinsă
- Actualizează `status` și `dismissedAt`

**POST /api/suggestions/generate**

- Generează sugestii noi folosind AI
- Analizează datele utilizatorului pentru personalizare
- Salvează sugestiile în baza de date

**GET /api/suggestions/history**

- Returnează istoricul sugestiilor
- Suport pentru filtrare după status

### 2. AI Generation Logic

#### System Prompt

```
You are Fitter AI, a wellness coach. Generate 3-5 personalized daily suggestions based on user data.

User Profile:
- Goals: [user goals]
- Age: [user age]
- Height: [user height]cm
- Weight: [user weight]kg

Today's Activity:
- Hydration: [glasses] glasses
- Sleep: [hours] hours
- Workout: [calories] calories
- Calories consumed: [calories]

Generate suggestions that are:
1. Specific and actionable
2. Based on their current activity levels
3. Helpful for their goals
4. Varied across categories (nutrition, exercise, sleep, hydration, wellness)

Return ONLY a JSON array with this exact format:
[
  {
    "title": "Brief suggestion title",
    "description": "Detailed explanation of the suggestion",
    "category": "nutrition|exercise|sleep|hydration|wellness|recovery",
    "priority": "high|medium|low",
    "emoji": "🏋️‍♂️",
    "actionText": "I'll do it",
    "dismissText": "Dismiss"
  }
]
```

#### Cron Job

- **Schedule**: 06:00 daily
- **Function**: `generateDailySuggestions()`
- **Process**:
  1. Găsește toți utilizatorii activi
  2. Verifică dacă au deja sugestii pentru ziua curentă
  3. Generează sugestii personalizate pentru fiecare utilizator
  4. Salvează sugestiile în baza de date
  5. Curăță sugestiile expirate

### 3. Dashboard Enhancements

#### Enhanced Dashboard Data

```typescript
interface DashboardData {
  daily: {
    hydration: number;
    workoutCalories: number;
    sleepHours: number;
    mealCount: number;
    totalCalories: number;
    totalProtein: number;
    energyLevel: number; // NEW: Calculated based on sleep
  };
  recent: {
    logs: Log[];
    nutrition: NutritionLog[];
    chatMessages: ChatMessage[];
    suggestions: Suggestion[]; // NEW: AI suggestions
  };
  stats: {
    totalLogs: number;
    totalNutrition: number;
    totalChatMessages: number;
    activeSuggestions: number; // NEW
  };
  analytics: {
    weeklyEnergy: Array<{
      // NEW: Energy curve data
      day: string;
      energy: number;
      sleep: number;
    }>;
    nutritionTargets: {
      // NEW: Nutrition targets
      protein: number;
      carbs: number;
      fats: number;
      water: number;
    };
    nutritionProgress: {
      // NEW: Progress percentages
      protein: number;
      carbs: number;
      fats: number;
      water: number;
    };
  };
}
```

#### Energy Level Calculation

```typescript
const calculateEnergyLevel = (sleepHours: number): number => {
  if (sleepHours >= 8) return 90 + Math.min(10, (sleepHours - 8) * 2);
  if (sleepHours >= 7) return 80 + (sleepHours - 7) * 10;
  if (sleepHours >= 6) return 60 + (sleepHours - 6) * 20;
  if (sleepHours >= 5) return 40 + (sleepHours - 5) * 20;
  return Math.max(20, sleepHours * 8);
};
```

#### Weekly Energy Data

- Calculează energia pentru fiecare zi din ultimele 7 zile
- Bazat pe orele de somn înregistrate
- Folosit pentru graficul Energy & Sleep

### 4. Frontend Updates

#### Dashboard Component

- **Real Energy Level**: Afișează nivelul de energie calculat bazat pe somn
- **Weekly Energy Chart**: Grafic cu date reale din ultimele 7 zile
- **Nutrition Progress**: Bare de progres cu date reale
- **AI Suggestions**: Secțiune nouă cu sugestii AI
- **Dynamic Data**: Toate datele vin din baza de date

#### API Client Updates

```typescript
// New methods added
async getSuggestions()
async completeSuggestion(id: string)
async dismissSuggestion(id: string)
async generateSuggestions()
```

## Database Schema

### Suggestion Collection

```javascript
{
  _id: ObjectId,
  userId: String (indexed),
  title: String,
  description: String,
  category: String (enum: nutrition, exercise, sleep, hydration, wellness, recovery),
  priority: String (enum: high, medium, low),
  status: String (enum: active, completed, dismissed, indexed),
  emoji: String,
  actionText: String,
  dismissText: String,
  generatedAt: Date,
  expiresAt: Date,
  completedAt: Date,
  dismissedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- `{ userId: 1, status: 1, createdAt: -1 }`
- `{ userId: 1, category: 1, status: 1 }`
- `{ generatedAt: 1 }`

## API Endpoints

### Suggestions

- `GET /api/suggestions` - Get active suggestions
- `POST /api/suggestions/:id/complete` - Complete suggestion
- `POST /api/suggestions/:id/dismiss` - Dismiss suggestion
- `POST /api/suggestions/generate` - Generate new suggestions
- `GET /api/suggestions/history` - Get suggestion history

### Dashboard

- `GET /api/dashboard/data` - Enhanced dashboard data

## Cron Jobs

### Daily Suggestions Generation

- **Schedule**: `0 6 * * *` (06:00 daily)
- **Function**: `generateDailySuggestions()`
- **Cleanup**: `cleanupExpiredSuggestions()`

## Performance

### Database Queries

- **Suggestions**: Indexed queries pentru performanță optimă
- **Dashboard**: Aggregated queries pentru date rapide
- **Energy Calculation**: Client-side pentru responsivitate

### Caching

- **Dashboard Data**: Cached pentru 5 minute
- **Suggestions**: Real-time updates
- **Energy Curve**: Calculat dinamic

## Security

### Data Isolation

- Toate query-urile filtrate după `userId`
- JWT authentication required
- Rate limiting pe toate endpoint-urile

### Input Validation

- Zod schemas pentru toate endpoint-urile
- Content sanitization
- AI response validation

## Monitoring

### Metrics

- Sugestii generate per utilizator
- Rate de completare sugestii
- Performance dashboard queries
- AI response times

### Error Handling

- Graceful fallback pentru AI failures
- Retry logic pentru cron jobs
- Comprehensive logging

## Testing

### Test Cases

1. **Suggestion Generation**

   - Test cu date complete utilizator
   - Test cu date incomplete
   - Test cu AI response invalid

2. **Dashboard Data**

   - Test cu utilizator nou (fără date)
   - Test cu utilizator cu date complete
   - Test energy calculation

3. **Cron Jobs**
   - Test generare sugestii
   - Test cleanup expired
   - Test error handling

## Deployment

### Environment Variables

```bash
GOOGLE_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_uri
```

### Dependencies

```json
{
  "@google/generative-ai": "^0.21.0",
  "node-cron": "^3.0.3"
}
```

## Next Steps

### Planned Features

- [ ] Suggestion categories filtering
- [ ] Suggestion analytics
- [ ] Push notifications pentru sugestii
- [ ] Suggestion templates
- [ ] A/B testing pentru sugestii

### Performance Optimizations

- [ ] Redis caching pentru dashboard data
- [ ] Background job processing
- [ ] Database query optimization
- [ ] CDN pentru static assets

## Concluzie

✅ **Sistemul de sugestii AI și îmbunătățirile dashboard-ului sunt complet implementate**:

- AI generează sugestii personalizate bazate pe datele utilizatorului
- Dashboard afișează date reale din baza de date
- Energy curve se ajustează în funcție de timpul de somn
- Cron job generează sugestii zilnic la 06:00
- Toate datele sunt persistente și se sincronizează în timp real

**Status**: Ready for testing and production use.

---

**Data implementării**: 23 Octombrie 2025  
**Tehnologii**: Node.js, Express, TypeScript, MongoDB, Google Gemini 1.5 Flash, React, Vite  
**Fișiere modificate**:

- Backend: `Suggestion.ts`, `suggestions.ts`, `dashboard.ts`, `daily.ts`, `suggestions.ts` (cron)
- Frontend: `api.ts`, `Dashboard.tsx`


