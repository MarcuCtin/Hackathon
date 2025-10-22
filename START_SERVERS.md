# 🚀 Quick Start Guide - Fitter App

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ MongoDB running (local or Atlas)
- ✅ Google Gemini API key (FREE!)

---

## 1️⃣ Backend Setup (First Time)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/fitter
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
GOOGLE_API_KEY=your-google-gemini-api-key-here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
EOF

# Start backend
npm run dev
```

**Backend will start on**: http://localhost:4000  
**Check health**: http://localhost:4000/health

---

## 2️⃣ Frontend Setup (First Time)

```bash
cd "Fitter Wellness App Design"

# Install dependencies
npm install

# (Optional) Create .env file to override API URL
echo "VITE_API_URL=http://localhost:4000/api" > .env

# Start frontend
npm run dev
```

**Frontend will start on**: http://localhost:3000  
**Vite proxy will forward**: `/api/*` → `http://localhost:4000/api/*`

---

## 3️⃣ Quick Test

1. Open http://localhost:3000
2. Click "Get Started" or "Try App"
3. Register a new account:
   - Name: Alex
   - Email: alex@test.com
   - Password: password123
4. Answer wellness questions
5. Go to AI Assistant (chat icon)
6. Type: "Help me sleep better"
7. See AI response! ✨

---

## 🔄 Daily Usage (After First Setup)

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

### Terminal 2: Frontend

```bash
cd "Fitter Wellness App Design"
npm run dev
```

---

## 🛠️ Troubleshooting

### MongoDB Not Running

```bash
# macOS/Linux
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Port Already in Use

```bash
# Find process on port 4000
lsof -ti:4000 | xargs kill -9

# Find process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Gemini API Key Invalid

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key" (FREE!)
3. Update `GOOGLE_API_KEY` in `backend/.env`
4. Restart backend: `npm run dev`

Note: Gemini offers FREE tier (15 req/min, 1,500 req/day)

### Vite Proxy Not Working

1. Stop frontend server (Ctrl+C)
2. Check `vite.config.ts` has proxy configured
3. Restart: `npm run dev`

---

## 📦 Docker Setup (Alternative)

### Using Docker Compose (includes MongoDB + Backend)

```bash
cd backend

# Build and start
docker-compose up --build

# Stop
docker-compose down
```

Backend will be on http://localhost:4000  
MongoDB will be on port 27017

---

## ✅ Verify Integration

### Check Backend Health

```bash
curl http://localhost:4000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Check Frontend Proxy

1. Open DevTools → Network tab
2. Register a user
3. See request to `/api/auth/register` in Network tab
4. Check response has `{ success: true, data: { token: "..." } }`

### Test AI Chat

1. Go to AI Assistant
2. Type a message
3. Check Network tab for `/api/ai/chat`
4. Should see AI response in 1-3 seconds

### Test Profile

1. Go to Profile page
2. Should load user data automatically
3. Edit a field
4. Click "Save Changes"
5. See success toast

---

## 🎯 Environment Variables Reference

### Backend `.env`

```env
NODE_ENV=development           # or production
PORT=4000                      # Backend port
MONGO_URI=mongodb://localhost:27017/fitter
JWT_SECRET=your-secret-key     # Change in production!
JWT_EXPIRES_IN=7d              # Token expiry
OPENAI_API_KEY=sk-...          # From OpenAI dashboard
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX=100             # 100 requests per window
```

### Frontend `.env` (optional)

```env
VITE_API_URL=http://localhost:4000/api  # Override API base URL
```

---

## 📊 What's Running?

| Service           | Port  | URL                       |
| ----------------- | ----- | ------------------------- |
| Frontend (Vite)   | 3000  | http://localhost:3000     |
| Backend (Express) | 4000  | http://localhost:4000     |
| MongoDB           | 27017 | mongodb://localhost:27017 |

---

## 🔥 Hot Reload

Both servers support hot reload:

- **Backend**: Changes to `.ts` files auto-restart server
- **Frontend**: Changes to `.tsx` files auto-refresh browser

---

## 🧹 Clean Restart

```bash
# Backend
cd backend
rm -rf node_modules dist
npm install
npm run build
npm run dev

# Frontend
cd "Fitter Wellness App Design"
rm -rf node_modules dist
npm install
npm run dev
```

---

## 📚 Additional Resources

- **Backend Docs**: `/backend/IMPLEMENTATION.md`
- **Integration Guide**: `/FRONTEND_BACKEND_INTEGRATION.md`
- **Complete Status**: `/COMPLETE_INTEGRATION_STATUS.md`
- **Architecture**: `/INTEGRATION_DIAGRAM.md`

---

**Need help?** Check the troubleshooting section or examine browser/server console logs!
