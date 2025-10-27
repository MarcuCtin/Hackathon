# Fitter Wellness App

## Tech Stack

### Backend

- **Runtime**: node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod schema validation
- **AI Integration**: Google Generative AI (Gemini 1.5)
- **Containerization**: Docker & Docker Compose
- **Cron Jobs**: node-cron for scheduled tasks

### Frontend

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) + shadcn/ui components
- **Styling**: Tailwind CSS + CSS Modules
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Routing**: React Router v6
- **API Client**: Axios with custom wrapper
- **Notifications**: Sonner (toast notifications)

## Architecture

### Backend Structure

```
backend/src/
├── config/          # Environment & logger config
├── cron/            # Scheduled tasks (daily summaries, suggestions)
├── db/              # MongoDB connection
├── middleware/      # Auth, validation, error handling
├── models/          # Mongoose schemas (User, Log, Nutrition, etc.)
├── routes/          # REST API endpoints
├── services/        # Business logic (AI, insights, suggestions)
├── types/           # TypeScript definitions
└── utils/           # Helpers (JWT, errors, async wrapper)
```

### Frontend Structure

```
src/
├── components/      # React components (pages & UI)
├── context/         # Global state (ActivityContext, Auth)
├── hooks/           # Custom React hooks
├── lib/             # API client & utilities
└── styles/          # Global CSS & theme
```

### Key Design Patterns

- **RESTful API**: Clean endpoint structure with `/api` prefix
- **Middleware Chain**: Auth → Validation → Route Handler → Error Handler
- **Async Wrapper**: Centralized error handling for async routes
- **Context Providers**: Shared state for user data, logs, and nutrition
- **Component Composition**: Reusable UI components with shadcn/ui
- **Glassmorphism UI**: Modern design with backdrop blur and gradient overlays

### Features

- user authentication & onboarding
- AI-powered wellness coaching (Gemini)
- Activity logging (workouts, sleep, mood, hydration)
- Nutrition tracking with meal suggestions
- Daily reflections & mood tracking
- Personalized workout plans
- Progress insights & achievements
- Real-time dashboard with contextual updates

## Data Flow

1. **User Authentication** - JWT-based auth with secure password hashing
2. **Profile Management** - User onboarding and preference storage
3. **Activity Tracking** - Real-time logging of wellness activities
4. **AI Integration** - Context-aware recommendations and chat
5. **Data Persistence** - MongoDB storage with optimized queries
6. **Real-time Updates** - Live data synchronization between frontend and backend

## Key Features

- **AI-Powered Chat** - Intelligent wellness assistant
- **Nutrition Tracking** - Comprehensive meal and supplement logging
- **Workout Planning** - AI-generated fitness routines
- **Progress Analytics** - Data visualization and insights
- **Goal Setting** - Personalized targets and tracking
- **Reflection Journal** - Mood and wellness tracking
- **Achievement System** - Gamified progress rewards

## Development Workflow

1. **Feature Development** - Component and API endpoint creation
2. **Type Safety** - TypeScript throughout the stack
3. **Testing** - Comprehensive test coverage
4. **Code Review** - Peer review process
5. **Deployment** - Docker containerization
6. **Monitoring** - Logging and error tracking

## Performance Metrics

- **Backend Response Time** - < 200ms average
- **Frontend Load Time** - < 2s initial load
- **Database Queries** - Optimized with proper indexing
- **Memory Usage** - Efficient resource utilization
- **Bundle Size** - Optimized with code splitting

## Security Considerations

- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Mongoose ODM protection
- **XSS Protection** - Content sanitization
- **CSRF Protection** - Token-based validation
- **Rate Limiting** - API abuse prevention
- **Secure Headers** - Helmet middleware configuration

## 📱 Mobile Responsiveness

- **Mobile-First Design** - Responsive breakpoints
- **Touch Interactions** - Mobile-optimized gestures
- **Progressive Web App** - App-like mobile experience
- **Offline Support** - Local data persistence
- **Performance** - Optimized for mobile devices

## Deployment

- **Docker Containers** - Consistent deployment environment
- **Environment Configuration** - Secure secret management
- **Database Migration** - Schema versioning
- **Health Checks** - Service monitoring
- **Scaling** - Horizontal scaling support

### Environment Variables

Backend requires:

- `MONGO_URI` - MongoDB connection string
- `GOOGLE_API_KEY` - Gemini API key
- `JWT_SECRET` - Secret for token signing
- `GEMINI_MODEL` (optional) - AI model selection

Frontend requires:

- `VITE_API_URL` - Backend API base URL
