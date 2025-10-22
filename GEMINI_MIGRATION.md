# 🌟 Migrare de la OpenAI la Google Gemini

## ✅ Schimbări Completate

Backend-ul Fitter folosește acum **Google Gemini 1.5 Flash** în loc de OpenAI GPT-4o-mini!

---

## 🎯 De Ce Gemini?

| Metric             | OpenAI GPT-4o-mini    | Google Gemini 1.5 Flash    | Winner                         |
| ------------------ | --------------------- | -------------------------- | ------------------------------ |
| **Cost**           | $0.15/1M input tokens | $0.075/1M tokens           | ✅ **Gemini (50% mai ieftin)** |
| **Viteză**         | 1-3 secunde           | 0.5-1 secundă              | ✅ **Gemini (2x mai rapid)**   |
| **Context Window** | 128K tokens           | **1M tokens**              | ✅ **Gemini (8x mai mare!)**   |
| **Gratuit**        | Nu                    | **Da (15 req/min)**        | ✅ **Gemini**                  |
| **Multimodal**     | Da (imagini)          | Da (imagini, audio, video) | ✅ **Gemini**                  |

---

## 📦 Ce S-a Schimbat

### 1. **Dependențe Package.json**

```bash
# Eliminat
- openai

# Adăugat
+ @google/generative-ai
```

### 2. **Environment Variables**

```bash
# Înainte
OPENAI_API_KEY=sk-...

# Acum
GOOGLE_API_KEY=your-gemini-key-here
```

### 3. **Serviciu AI**

```typescript
// Înainte: src/services/openai.ts
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

// Acum: src/services/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
```

### 4. **Fișiere Modificate**

- ✅ `backend/src/config/env.ts` - Înlocuit `OPENAI_API_KEY` cu `GOOGLE_API_KEY`
- ✅ `backend/src/services/openai.ts` → `gemini.ts` - Redenumit și reimplementat
- ✅ `backend/src/routes/ai.ts` - Actualizat import-ul
- ✅ `backend/env.example.txt` - Actualizat variabilele de mediu
- ✅ `backend/package.json` - Eliminat OpenAI, adăugat Gemini
- ✅ `README.md` - Actualizat documentația

---

## 🚀 Cum Obții API Key pentru Gemini

### Opțiune 1: Gratuit (Recomandat)

1. Mergi la https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Alege un Google Cloud Project (sau creează unul nou)
4. Copiază cheia generată

**Limite Gratuite:**

- 15 requests/minut
- 1,500 requests/zi
- Perfect pentru development și demo-uri!

### Opțiune 2: Paid (Pentru Producție)

1. Configurează Google Cloud billing
2. Activează "Generative Language API"
3. Folosește aceeași cheie, dar fără limite

**Prețuri:**

- Gemini 1.5 Flash: **$0.075/1M tokens** (input + output)
- Gemini 1.5 Pro: $1.25/1M tokens (mai bun pentru task-uri complexe)

---

## 🔧 Setup Rapid

### 1. Instalează Dependențele

```bash
cd backend
npm install
```

### 2. Configurează .env

```bash
# Copiază exemplul
cp env.example.txt .env

# Editează .env și adaugă cheia ta Gemini
nano .env
```

Adaugă în `.env`:

```env
GOOGLE_API_KEY=your-actual-gemini-api-key-here
```

### 3. Pornește Backend-ul

```bash
npm run dev
```

### 4. Testează AI Chat

```bash
# Obține token de la /api/auth/login sau /api/auth/register
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Help me sleep better"}
    ]
  }'
```

Răspuns:

```json
{
  "success": true,
  "data": {
    "reply": "Here are some tips for better sleep: ...",
    "provider": "gemini"
  }
}
```

---

## 📊 Comparație Tehnică

### Conversie Mesaje

**OpenAI Format:**

```typescript
messages = [
  { role: "system", content: "You are a coach" },
  { role: "user", content: "Hello" },
  { role: "assistant", content: "Hi there!" },
];
```

**Gemini Format (intern):**

```typescript
prompt = `
System: You are a coach

User: Hello
```
