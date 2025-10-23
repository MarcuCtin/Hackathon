# Testing Guide - AI Action Persistence

## Pregătire

### 1. Verifică Environment Variables

**Backend** (`/backend/.env`):

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/fitter
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
GOOGLE_API_KEY=your-google-gemini-api-key-here
LOG_LEVEL=info
```

⚠️ **Important**: `GOOGLE_API_KEY` trebuie să fie valid (obține de la [Google AI Studio](https://makersuite.google.com/app/apikey))

### 2. Start Servers

#### Terminal 1 - Backend

```bash
cd backend
npm install
npm run dev
```

Verifică output:

```
✓ Connected to MongoDB
✓ Server listening on http://localhost:4000
```

#### Terminal 2 - Frontend

```bash
cd "Fitter Wellness App Design"
npm install
npm run dev
```

Verifică output:

```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

### 3. Deschide Browser

Navighează la `http://localhost:3000`

## Test Suite

### Test 1: User Registration & Onboarding

**Steps**:

1. Click "Start Your Journey" sau "Get Started"
2. Completează formularul de înregistrare:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
3. Click "Create Account"
4. Răspunde la întrebările de onboarding (alege orice opțiuni)
5. Click "Continue" până la final, apoi "Finish"

**Expected**:

- ✅ Redirect automat la Dashboard după finalizare
- ✅ Toast "Welcome to Fitter!" sau similar
- ✅ Dashboard afișează user name în header
- ✅ Badge-uri în header cu valori 0/implicite

### Test 2: Water Logging via AI

**Steps**:

1. Din Dashboard, click pe tab "Assistant" (bottom navigation)
2. În chat, scrie: **"I drank 5 glasses of water"**
3. Apasă Enter sau click Send

**Expected**:

- ✅ AI răspunde cu mesaj motivațional (ex: "Great job staying hydrated! 💧")
- ✅ Toast apare: "💧 Hydration logged: 5 glasses"
- ✅ Badge în header: `💧 5 logged` (sau similar)
- ✅ Mesajul AI apare în chat

**Verify în Database** (optional):

```bash
# MongoDB Compass sau mongo shell
use fitter
db.logs.find({type: "hydration"}).sort({createdAt: -1}).limit(1)
```

Ar trebui să vezi:

```json
{
  "_id": "...",
  "userId": "...",
  "type": "hydration",
  "value": 5,
  "unit": "glasses",
  "date": "2025-...",
  "createdAt": "..."
}
```

### Test 3: Sleep Logging

**Steps**:

1. În Assistant chat, scrie: **"I slept 7 hours last night"**
2. Send

**Expected**:

- ✅ AI: "Great! Rest is essential. 😴" (sau similar)
- ✅ Toast: mesaj confirmare sleep
- ✅ Badge: `🛌 7 h sleep`

**Verify**:

- Click pe tab "History" → vezi entry nou "Sleep recorded: 7 hours"
- În Dashboard, card "Sleep & Energy" arată 7h

### Test 4: Workout Logging (Minutes)

**Steps**:

1. În Assistant, scrie: **"I did cardio for 45 minutes"**
2. Send

**Expected**:

- ✅ AI: "Awesome workout! 💪"
- ✅ Toast: "🔥 Workout logged: 360 kcal in 45 min" (45 \* 8 = 360)
- ✅ Badge: `🔥 360 kcal today`

**Verify**:

- History tab → "Workout logged: 360 kcal · cardio"
- Badge se actualizează dacă mai trimiți un workout (cumulativ)

### Test 5: Workout Logging (Calories Direct)

**Steps**:

1. Scrie: **"I burned 1000 calories at the gym"**
2. Send

**Expected**:

- ✅ AI: "Incredible effort! 🔥"
- ✅ Toast: "🔥 Workout logged: 1000 kcal"
- ✅ Badge: `🔥 1360 kcal today` (360 + 1000)

### Test 6: Meal Logging

**Steps**:

1. Scrie: **"I ate pasta for lunch"**
2. Send

**Expected**:

- ✅ AI: "Noted! Pasta can be a good energy source. 🍝"
- ✅ Toast: "🥗 Meal saved"
- ✅ Badge: `🥗 1 meals` (incrementat)

**Verify**:

- Click pe tab "Nutrition"
- Vezi meal entry nou cu "pasta" și lunch time
- Total meals today: 1

### Test 7: Multiple Actions in One Message

**Steps**:

1. Scrie: **"Today I drank 3 glasses of water and slept 8 hours"**
2. Send

**Expected**:

- ✅ AI răspunde recunoscând ambele acțiuni
- ✅ **Două toasts**: unul pentru water, unul pentru sleep
- ✅ Badge water: `💧 8 logged` (5 + 3)
- ✅ Badge sleep: `🛌 8 h sleep` (ultimul entry)

**Verify**:

- History tab → două entries noi (hydration + sleep)

### Test 8: No Action (Conversational)

**Steps**:

1. Scrie: **"What is a healthy diet?"**
2. Send

**Expected**:

- ✅ AI răspunde cu sfaturi generale despre nutriție
- ✅ **Fără toasts** (nu există acțiuni de persistat)
- ✅ Badge-urile rămân neschimbate

### Test 9: Alias Support ("water" vs "water_log")

**Steps**:

1. Scrie: **"I drank 2 liters of water"**
2. Send

**Expected**:

- ✅ AI returnează action cu `type: "water"` SAU `"water_log"`
- ✅ Frontend acceptă ambele variante
- ✅ Toast + badge update (total water)

### Test 10: Error Handling - Backend Down

**Steps**:

1. **Stop backend** (Ctrl+C în terminal backend)
2. În Assistant, scrie orice mesaj
3. Send

**Expected**:

- ✅ Toast error: "Failed to get AI response. Please try again."
- ✅ **UI nu se blochează** (chat input rămâne disponibil)
- ✅ Fallback message în chat: "I'm having trouble connecting..."

**Cleanup**:

- Restart backend (`npm run dev`)

### Test 11: Dashboard Integration

**Steps**:

1. După ce ai efectuat toate test-urile de mai sus, navighează la tab "Dashboard"
2. Observă cards:
   - **Today's Stats**: arată total water, calories, sleep
   - **Recent Activity**: timeline cu entries recente
   - **Progress**: grafice (dacă există date pe multiple zile)

**Expected**:

- ✅ Card "Hydration": `8 glasses` (din test 2 + 7)
- ✅ Card "Calories": `1360 kcal` (din test 4 + 5)
- ✅ Card "Sleep": `8 h` (ultimul din test 7)
- ✅ Card "Meals": `1 meal` (din test 6)

### Test 12: History Page

**Steps**:

1. Click pe tab "History"
2. Verifică timeline

**Expected**:

- ✅ Entries sortate descrescător (cele mai recente sus)
- ✅ Fiecare entry arată:
  - Tip (icon + label)
  - Valoare (ex: "5 glasses", "360 kcal")
  - Timestamp
- ✅ Filtrare după dată (dacă disponibil)

### Test 13: Nutrition Page

**Steps**:

1. Click pe tab "Nutrition"
2. Verifică meal list

**Expected**:

- ✅ Meal entry "pasta" la lunch
- ✅ Daily totals (calories, protein, etc.)
- ✅ Progress bars către target

## Test Cases Edge

### Edge 1: Empty Message

**Input**: "" (gol)
**Expected**: Send button disabled

### Edge 2: Very Long Message

**Input**: (500+ caractere)
**Expected**: AI răspunde normal, nu crashează

### Edge 3: Special Characters

**Input**: "I drank 5 glasses 💧 of water"
**Expected**: AI parsează corect acțiunea

### Edge 4: Multiple Workouts Same Day

**Input 1**: "I did yoga for 30 minutes"
**Input 2**: "I lifted weights for 45 minutes"
**Expected**: Badge arată total calorii cumulate (240 + 360 = 600)

### Edge 5: Invalid Action Data

**Input**: "I drank water" (fără număr)
**Expected**:

- AI poate întreba clarificare SAU presupune valoare default
- Dacă nu se poate extrage amount, nu se creează log (fără toast)

## Debugging Tips

### Backend Logs

Verifică terminal backend pentru:

```
[info] POST /api/ai/chat
[info] AI response: {"message":"...","actions":[...]}
[info] POST /api/logs (201)
```

### Frontend Console

Deschide DevTools (F12) → Console:

```javascript
// Check context state
useActivityData();
// → {logs: [...], hydrationToday: 8, workoutCaloriesToday: 1360, ...}
```

### MongoDB Queries

```javascript
// Total water today
db.logs.aggregate([
  {
    $match: {
      type: "hydration",
      date: { $gte: new Date("2025-10-23T00:00:00Z") },
    },
  },
  { $group: { _id: null, total: { $sum: "$value" } } },
]);

// Recent logs
db.logs.find().sort({ createdAt: -1 }).limit(10);

// Nutrition logs
db.nutritionlogs.find().sort({ date: -1 }).limit(5);
```

### API Testing (Postman/curl)

```bash
# Get auth token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get logs
curl http://localhost:4000/api/logs?limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test AI chat
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"messages":[{"role":"user","content":"I drank 5 glasses of water"}]}'
```

## Expected Response Times

- AI chat: 1-3 seconds (depinde de Gemini latency)
- Log creation: <100ms
- Page navigation: instant (React router)
- Context refresh: <200ms (GET /api/logs + /api/nutrition/list)

## Success Criteria ✅

Toate test-urile 1-13 trec fără erori, UI-ul e responsive, badge-urile se actualizează corect, datele persistă în MongoDB.

## Known Issues / Limitations

- Gemini poate returna uneori text în loc de JSON → fallback la plain text cu `actions: []`
- Duplicate logs posibile dacă user trimite același mesaj de 2 ori rapid → OK, e comportament valid
- Sleep hours: se afișează ultimul entry (nu suma) → design decision, somn nu e cumulativ
- Meal calories default 0 dacă nu specificat → user poate edita manual în Nutrition page

## Next Test Phase

După ce toate test-urile manuale trec, consideră:

- [ ] Unit tests pentru `ActivityContext`
- [ ] Integration tests pentru API routes
- [ ] E2E cu Playwright/Cypress
- [ ] Load testing (multiple users simultan)
- [ ] Mobile responsiveness (resize browser)

