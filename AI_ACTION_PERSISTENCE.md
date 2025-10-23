# AI Action Persistence Implementation

## Obiectiv

Persistarea automată a acțiunilor detectate de AI (hidratare, somn, antrenament, masă) în baza de date MongoDB și afișarea lor în timp real în UI.

## Arhitectură

### Backend (`/backend`)

#### 1. AI Service (`src/services/gemini.ts`)

- **Model**: Google Gemini 1.5 Flash
- **Funcționalitate**:
  - Primește mesaje cu system prompt + conversație
  - Folosește `systemInstruction` pentru context persistent
  - Returnează text (JSON structurat)
  - Error handling robust pentru răspunsuri blocate/goale

```typescript
chatWithAi(messages: Array<{role, content}>) => Promise<string>
```

#### 2. AI Route (`src/routes/ai.ts`)

- **Endpoint**: `POST /api/ai/chat`
- **System Prompt Dinamic**:
  - Include obiective user (goals)
  - Include răspunsuri onboarding
  - Include date identitate (vârstă, înălțime, greutate)
  - Instrucțiuni pentru structured output (JSON)
- **Action Types Suportate**:

  - `water_log`: hidratare (amount, unit)
  - `sleep_log`: somn (hours)
  - `workout_log`: antrenament (calories SAU minutes, optional category)
  - `meal_log`: masă (notes, optional calories, category: breakfast/lunch/dinner/snack)

- **Format Răspuns**:

```json
{
  "success": true,
  "data": {
    "reply": "mesaj pentru user",
    "actions": [
      { "type": "water_log", "amount": 5, "unit": "glasses" },
      { "type": "workout_log", "calories": 450, "category": "cardio" }
    ]
  }
}
```

#### 3. Logs API (`src/routes/logs.ts`)

- **POST /api/logs**: Creează entry de tip hydration/sleep/workout/mood/steps
- **GET /api/logs**: Obține logs cu filtrare (type, from, to, limit)

#### 4. Nutrition API (`src/routes/nutrition.ts`)

- **POST /api/nutrition/log**: Creează meal log
- **GET /api/nutrition/list**: Obține meal logs

### Frontend (`/Fitter Wellness App Design`)

#### 1. Activity Context (`src/context/ActivityContext.tsx`)

- **Provider global** pentru date activitate
- **State**:

  - `logs`: array de Log objects
  - `nutritionLogs`: array de NutritionLog objects
  - `hydrationToday`: total pahare/litri azi
  - `workoutCaloriesToday`: total calorii azi
  - `sleepHoursToday`: ore somn azi (ultimul entry)
  - `mealCountToday`: număr mese azi

- **Methods**:

  - `addLog(log)`: adaugă log nou în state (optimistic update)
  - `addNutritionLog(log)`: adaugă meal log în state
  - `refreshLogs()`: re-fetch logs din API
  - `refreshNutrition()`: re-fetch nutrition din API
  - `refreshAll()`: refresh complet

- **Auto-loading**: La mount, fetch automat toate datele

#### 2. Assistant Page (`src/components/AssistantPage.tsx`)

- **Chat UI** cu AI
- **Action Processing**:
  - Primește `data.actions` de la `/api/ai/chat`
  - Pentru fiecare acțiune:
    - `water_log` sau `water` → `api.createLog({type: 'hydration', ...})` → `addLog()` → toast ✅
    - `sleep_log` → `api.createLog({type: 'sleep', ...})` → `addLog()` → toast ✅
    - `workout_log` → calculează calories (din calories SAU minutes\*8) → `api.createLog({type: 'workout', ...})` → `addLog()` → toast ✅
    - `meal_log` → mapează la mealType valid → `api.logMeal({...})` → `addNutritionLog()` → toast ✅
- **Header Badges**:

  - 🔥 `{workoutCaloriesToday} kcal today`
  - 💧 `{hydrationToday} logged`
  - 🛌 `{sleepHoursToday} h sleep`
  - 🥗 `{mealCountToday} meals`

- **Non-blocking**: Toate API calls cu `.catch()`, UI continuă la eroare

#### 3. Dashboard (`src/components/Dashboard.tsx`)

- Folosește `useActivityData()` pentru metrici live
- Afișează statistici zilnice din context
- Actualizare automată când context se schimbă

#### 4. History Page (`src/components/HistoryPage.tsx`)

- Timeline cu toate logs
- Filtrare după tip/dată
- Folosește `logs` din context

#### 5. Nutrition Page (`src/components/NutritionPage.tsx`)

- Lista meal logs
- Statistici nutriționale (calorii, proteine)
- Folosește `nutritionLogs` din context

#### 6. Main Entry (`src/main.tsx`)

- Wraps:

```tsx
<AuthProvider>
  <ActivityProvider>
    <App />
    <Toaster />
  </ActivityProvider>
</AuthProvider>
```

## Flow Complet: User → AI → DB → UI

### Exemplu: "I drank 5 glasses of water"

1. **User input** în `AssistantPage` → `handleSend()`
2. **Frontend** → `POST /api/ai/chat` cu conversație
3. **Backend** construiește system prompt dinamic cu user context
4. **Gemini** primește prompt + user message
5. **Gemini** returnează:

```json
{
  "message": "Great job staying hydrated! 💧",
  "actions": [{ "type": "water_log", "amount": 5, "unit": "glasses" }]
}
```

6. **Backend** parsează JSON, validează cu Zod, returnează la frontend
7. **Frontend** primește `data.actions`
8. **Pentru fiecare action**:
   - Detectează `type === "water_log"` SAU `"water"`
   - Apelează `api.createLog({type: 'hydration', value: 5, unit: 'glasses', date: now})`
   - Backend creează document în MongoDB (`Log` model)
   - Backend returnează log creat
   - Frontend apelează `addLog(result.data)` → actualizează context
   - Context recalculează `hydrationToday` (suma tuturor entries hydration din azi)
   - Toate componentele care folosesc `useActivityData()` se re-render automat cu valori noi
   - Toast: "💧 Hydration logged: 5 glasses"
9. **UI Updates**:
   - Badge în `AssistantPage`: `💧 {hydrationToday} logged` (ex: 5 → 10)
   - Entry nou în `HistoryPage` timeline
   - Statistici actualizate în `Dashboard`

### Exemplu: "I worked out for 45 minutes doing cardio"

1-6. (similar cu mai sus) 7. Gemini returnează:

```json
{
  "message": "Awesome workout! 💪",
  "actions": [{ "type": "workout_log", "minutes": 45, "category": "cardio" }]
}
```

8. Frontend:
   - Calculează `calories = 45 * 8 = 360`
   - `api.createLog({type: 'workout', value: 360, unit: 'kcal', note: 'cardio', date: now})`
   - `addLog(result.data)` → context update
   - Toast: "🔥 Workout logged: 360 kcal in 45 min"
9. **UI Updates**:
   - Badge: `🔥 {workoutCaloriesToday} kcal today` (ex: 200 → 560)
   - History timeline entry nou
   - Dashboard charts actualizate

### Exemplu: "I ate pasta for lunch"

1-6. (similar) 7. Gemini:

```json
{
  "message": "Noted! Pasta can be a good energy source. 🍝",
  "actions": [{ "type": "meal_log", "notes": "pasta", "category": "lunch" }]
}
```

8. Frontend:
   - Mapează `category: "lunch"` → mealType valid
   - `api.logMeal({date: now, mealType: 'lunch', items: [{name: 'pasta', calories: 0, protein: 0, carbs: 0, fat: 0}]})`
   - Backend creează `NutritionLog` în MongoDB
   - `addNutritionLog(result.data)` → context update
   - Toast: "🥗 Meal saved"
9. **UI Updates**:
   - Badge: `🥗 {mealCountToday} meals` (ex: 2 → 3)
   - Entry nou în `NutritionPage` meal list
   - Dashboard nutrition card update

## Error Handling

### Backend

- Zod validation pentru toate inputs
- Try/catch în `chatWithAi` → fallback messages
- JSON parse errors → return plain text cu `actions: []`
- Gemini blocked responses → user-friendly message

### Frontend

- Toate `api.*` calls wrapped în `.catch()`
- Toast error messages la fail
- UI nu se blochează
- Optimistic updates (addLog/addNutritionLog) → re-fetch manual dacă user suspectează issue

## Type Aliases

Frontend acceptă:

- `"water_log"` SAU `"water"` → hydration
- `"sleep_log"` → sleep
- `"workout_log"` → workout
- `"meal_log"` → nutrition

Backend prompt specifică doar tipurile canonice (`*_log`), dar frontend e tolerant.

## Testing

### Manual Test Cases

1. **Water**: "am băut 5 pahare de apă" → hydration +5, badge update, history entry
2. **Sleep**: "am dormit 7 ore" → sleep log, badge 🛌 7h
3. **Workout (minutes)**: "am lucrat cardio 45 de minute" → workout 360 kcal, badge 🔥
4. **Workout (calories)**: "am ars 1000 de calorii" → workout 1000 kcal, badge 🔥
5. **Meal**: "am mâncat paste la prânz" → meal log, badge 🥗 +1
6. **Multiple actions**: "am băut 3 pahare de apă și am dormit 8 ore" → 2 logs, 2 toasts, 2 badge updates
7. **No action**: "ce este fitness?" → reply normal, fără actions, fără persistare

### Error Scenarios

- Backend offline → toast error, UI functional
- Invalid JSON din Gemini → fallback la text, `actions: []`
- Gemini blocked response → user-friendly message
- DB write fail → toast error, nu afectează chat

## Performance

- Context provider cu `useMemo` pentru computed values
- `addLog`/`addNutritionLog` sunt optimistic (nu așteaptă re-fetch complet)
- Re-fetch manual doar la mount sau user refresh
- Toast-uri non-blocking (Sonner library)

## Next Steps (Optional)

- [ ] Validare mai strictă pentru meal calories (user poate specifica numeric)
- [ ] Support pentru `emotion_update` action type (mood tracking)
- [ ] Undo action (delete recent log)
- [ ] Batch actions (multiple entries simultan)
- [ ] Webhook pentru notificări push (PWA)
- [ ] Offline support cu service worker

