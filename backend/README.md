## Fitter Backend (Node.js + Express + TypeScript)

### Quick start

1. Copy env and install

```bash
cp .env.example .env
npm ci
npm run dev
```

### Env

- NODE_ENV, PORT
- MONGO_URI
- JWT_SECRET (≥32 chars)
- OPENAI_API_KEY
- LOG_LEVEL, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX

### Scripts

- `npm run dev` – watch mode
- `npm run build && npm start` – production
- `npm run lint` – lint
- `npm run typecheck` – TS strict

### Docker

```bash
docker compose up --build
```

### Routes (proxied under /api)

- POST /api/auth/register | /api/auth/login | GET /api/auth/me
- GET/PUT /api/profile
- GET/POST /api/logs
- POST /api/nutrition/log, GET /api/nutrition/list
- GET /api/suggestions
- GET /api/insights, POST /api/insights/refresh
- POST /api/ai/chat
