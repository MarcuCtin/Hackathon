# 🚀 Fitter Backend - Quick Start

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas URI)
- OpenAI API key

## Setup (2 minutes)

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create `.env` file

```bash
# Copy and edit
cp env.example.txt .env
```

Required variables:

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/fitter
JWT_SECRET=your-secret-min-32-chars-long-random-string
OPENAI_API_KEY=sk-proj-...
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

### 3. Run development server

```bash
npm run dev
```

API available at `http://localhost:4000/api`

## Docker (recommended)

```bash
# Edit docker-compose.yml to set JWT_SECRET and OPENAI_API_KEY
docker compose up --build
```

## Test the API

```bash
# Health check
curl http://localhost:4000/api/health

# Register user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login (get token)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token for protected routes
curl http://localhost:4000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Production Build

```bash
npm run build  # Compiles to dist/
npm start      # Runs compiled JS
```

## Available Scripts

- `npm run dev` - Development with hot reload (tsx watch)
- `npm run build` - TypeScript compilation
- `npm start` - Run production build
- `npm run typecheck` - Type check without build
- `npm run lint` - ESLint check
- `npm run lint:fix` - Auto-fix linting issues

## Key Routes

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Profile**: `/api/profile` (GET, PUT)
- **Logs**: `/api/logs` (GET, POST)
- **Nutrition**: `/api/nutrition/log`, `/api/nutrition/list`
- **AI**: `/api/ai/chat`
- **Insights**: `/api/insights`, `/api/insights/refresh`
- **Suggestions**: `/api/suggestions`

See `IMPLEMENTATION.md` for full documentation.

## Troubleshooting

**MongoDB connection error**: Ensure MongoDB is running or update MONGO_URI
**OpenAI error**: Verify OPENAI_API_KEY is valid
**Type errors**: Run `npm install` to ensure all @types packages are installed
**Port in use**: Change PORT in `.env`

## Next Steps

1. ✅ Backend is ready
2. Configure frontend to use `/api` routes (proxy or CORS)
3. Test auth flow
4. Test AI chat with wellness questions
5. Monitor logs with Pino pretty-print

---

**Status**: Production-ready! ✨
