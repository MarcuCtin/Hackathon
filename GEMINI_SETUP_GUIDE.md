# 🌟 Ghid Complet: Configurare Google Gemini

## 🎯 Cum Obții API Key GRATUIT

### Pasul 1: Accesează Google AI Studio

```
https://makersuite.google.com/app/apikey
```

### Pasul 2: Autentificare

- Login cu contul tău Google
- Prima dată vei vedea "Welcome to Google AI Studio"

### Pasul 3: Creează API Key

1. Click pe **"Create API Key"** (buton albastru)
2. Selectează un **Google Cloud Project**:
   - Dacă nu ai unul, click "Create a new project"
   - Numele nu contează (ex: "Fitter-AI")
3. Așteaptă 2-3 secunde
4. Cheia ta va apărea! (începe cu `AI...`)

### Pasul 4: Copiază Cheia

```
AIzaSyC... [your key here]
```

⚠️ **IMPORTANT**: Salvează cheia undeva sigur! Nu o partaja public!

---

## 🔧 Configurare Backend

### 1. Deschide/Creează `.env`

```bash
cd backend
nano .env  # sau orice editor preferat
```

### 2. Adaugă Cheia

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/fitter
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long
GOOGLE_API_KEY=AIzaSyC...your-actual-key-here
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

### 3. Șterge Cheia Veche (Dacă Există)

```bash
# Șterge linia asta dacă o găsești:
# OPENAI_API_KEY=sk-...
```

### 4. Salvează Fișierul

- `Ctrl+O` apoi `Enter` (nano)
- `Cmd+S` (VS Code)

---

## 🚀 Pornire & Testare

### 1. Pornește Backend-ul

```bash
cd backend
npm run dev
```

Ar trebui să vezi:

```
Server running on port 4000
MongoDB connected
```

### 2. Pornește Frontend-ul (Terminal Nou)

```bash
cd "Fitter Wellness App Design"
npm run dev
```

### 3. Testează în Browser

1. Deschide http://localhost:3000
2. Click **"Get Started"** sau **"Try App"**
3. **Înregistrare**:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Răspunde la întrebările de onboarding
5. Click pe iconul **Chat** din bottom nav
6. Scrie: **"Help me sleep better"**
7. ✨ **Primești răspuns de la Gemini în <1 secundă!**

---

## 📊 Limite FREE Tier

| Limită             | Valoare   | Note                       |
| ------------------ | --------- | -------------------------- |
| **Requests/minut** | 15        | Perfect pentru development |
| **Requests/zi**    | 1,500     | ~60 req/oră                |
| **Context window** | 1M tokens | Imens!                     |
| **Preț**           | $0        | Complet gratuit!           |

**Pentru Producție**:

- Activează billing în Google Cloud
- Prețuri: $0.075/1M tokens (50% mai ieftin decât OpenAI!)

---

## 🧪 Testare Manuală (cURL)

### Test 1: Health Check

```bash
curl http://localhost:4000/health
```

Răspuns:

```json
{ "status": "ok", "timestamp": "2025-..." }
```

### Test 2: Register

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Răspuns:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJ..."
  }
}
```

### Test 3: AI Chat (cu token)

```bash
# Înlocuiește YOUR_TOKEN cu tokenul de la register
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "messages": [
      {"role": "user", "content": "Give me 3 quick health tips"}
    ]
  }'
```

Răspuns:

```json
{
  "success": true,
  "data": {
    "reply": "Here are 3 quick health tips:\n\n1. Drink water...",
    "provider": "gemini"
  }
}
```

---

## 🔍 Troubleshooting

### ❌ Error: "Invalid environment variables: GOOGLE_API_KEY"

**Cauză**: Cheia lipsește din `.env`

**Fix**:

```bash
cd backend
echo "GOOGLE_API_KEY=AIzaSy..." >> .env
npm run dev
```

---

### ❌ Error: "API key not valid"

**Cauză**: Cheia e greșită sau API-ul nu e activat

**Fix**:

1. Verifică cheia în https://makersuite.google.com/app/apikey
2. Copiază din nou (nu trebuie să conțină spații)
3. Dacă e corectă, mergi la Google Cloud Console:
   - https://console.cloud.google.com/apis/library
   - Caută "Generative Language API"
   - Click "Enable"

---

### ❌ Error: "Resource has been exhausted (e.g. check quota)"

**Cauză**: Ai depășit limita de 15 req/minut

**Fix**:

- Așteaptă 1 minut
- Sau activează billing pentru limite mai mari

---

### ❌ Error: Backend crashes cu "Cannot find module"

**Cauză**: Dependencies lipsă

**Fix**:

```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

---

## 📈 Performanță Așteptată

| Operație          | Timp Așteptat                                |
| ----------------- | -------------------------------------------- |
| Health check      | < 10ms                                       |
| Register/Login    | 200-400ms                                    |
| Profile load      | 100-300ms                                    |
| **AI Chat**       | **0.5-1s** ⚡ (mult mai rapid decât OpenAI!) |
| Daily suggestions | 300-500ms                                    |

---

## 🎁 Avantaje Gemini vs OpenAI

| Feature        | OpenAI GPT-4o-mini | Gemini 1.5 Flash       | Winner        |
| -------------- | ------------------ | ---------------------- | ------------- |
| **Preț**       | $0.15/1M tokens    | $0.075/1M tokens       | ✅ **Gemini** |
| **Viteză**     | 1-3s               | 0.5-1s                 | ✅ **Gemini** |
| **FREE tier**  | ❌                 | ✅ (15 req/min)        | ✅ **Gemini** |
| **Context**    | 128K tokens        | **1M tokens**          | ✅ **Gemini** |
| **Multimodal** | Images             | Images + Audio + Video | ✅ **Gemini** |
| **Calitate**   | Excelent           | Excelent               | 🤝 **Egal**   |

---

## 💡 Tips & Best Practices

### 1. Development

- Folosește FREE tier (15 req/min)
- Perfect pentru testing & demo

### 2. Production

- Activează billing
- Setează rate limiting în backend
- Monitorizează costurile

### 3. Optimizare

```typescript
// În backend/src/services/gemini.ts

// Pentru răspunsuri mai scurte (mai ieftin):
maxOutputTokens: 200;

// Pentru răspunsuri mai creative:
temperature: 0.9;

// Pentru răspunsuri mai consistente:
temperature: 0.3;
```

### 4. Securitate

- ❌ **NU** pune `GOOGLE_API_KEY` în frontend!
- ✅ Ține-o **doar** în `backend/.env`
- ✅ Adaugă `.env` în `.gitignore`

---

## ✅ Checklist Final

- [ ] Am obținut API key de la https://makersuite.google.com/app/apikey
- [ ] Am adăugat `GOOGLE_API_KEY` în `backend/.env`
- [ ] Am șters `OPENAI_API_KEY` din `.env` (dacă exista)
- [ ] Backend pornește fără erori (`npm run dev`)
- [ ] Frontend pornește fără erori (`npm run dev`)
- [ ] Pot înregistra un user
- [ ] Pot trimite mesaje în AI Chat
- [ ] Primesc răspunsuri rapide (<1s) de la Gemini
- [ ] Văd `{ provider: 'gemini' }` în browser console

---

## 🆘 Ajutor Rapid

**Backend nu pornește?**

```bash
cd backend
rm -rf node_modules dist
npm install
npm run dev
```

**Frontend nu vede backend-ul?**

- Verifică că backend rulează pe port 4000
- Verifică `vite.config.ts` are proxy configurat
- Restart frontend: `Ctrl+C` apoi `npm run dev`

**Gemini nu răspunde?**

1. Verifică cheia în `.env`
2. Verifică backend logs pentru erori
3. Testează cu cURL (vezi Test 3 mai sus)
4. Verifică limita de 15 req/minut

---

## 📚 Resurse Utile

- **Gemini API Docs**: https://ai.google.dev/docs
- **API Key Management**: https://makersuite.google.com/app/apikey
- **Pricing**: https://ai.google.dev/pricing
- **Models**: https://ai.google.dev/models/gemini

---

## 🎉 Gata!

Acum ai backend-ul Fitter cu Google Gemini funcțional!

**Mai rapid. Mai ieftin. Gratuit pentru development!** 🚀

Testează-l: http://localhost:3000 → AI Assistant 💬
