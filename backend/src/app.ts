import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { loadEnv } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import logsRoutes from './routes/logs.js';
import nutritionRoutes from './routes/nutrition.js';
import suggestionsRoutes from './routes/suggestions.js';
import insightsRoutes from './routes/insights.js';
import aiRoutes from './routes/ai.js';
import chatRoutes from './routes/chat.js';
import dashboardRoutes from './routes/dashboard.js';
import workoutRoutes from './routes/workouts.js';
import dailyTasksRoutes from './routes/dailyTasks.js';
import achievementsRoutes from './routes/achievements.js';
import supplementsRoutes from './routes/supplements.js';
import nutritionTipsRoutes from './routes/nutritionTips.js';
import historyRoutes from './routes/history.js';
import nutritionPageRoutes from './routes/nutritionPage.js';
import userTargetsRoutes from './routes/userTargets.js';
import userPlansRoutes from './routes/userPlans.js';

const env = loadEnv();

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('tiny'));
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/logs', logsRoutes);
  app.use('/api/nutrition', nutritionRoutes);
  app.use('/api/suggestions', suggestionsRoutes);
  app.use('/api/insights', insightsRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/workouts', workoutRoutes);
  app.use('/api/daily-tasks', dailyTasksRoutes);
  app.use('/api/achievements', achievementsRoutes);
  app.use('/api/supplements', supplementsRoutes);
  app.use('/api/nutrition-tips', nutritionTipsRoutes);
  app.use('/api/history', historyRoutes);
  app.use('/api/nutrition-page', nutritionPageRoutes);
  app.use('/api/user-targets', userTargetsRoutes);
  app.use('/api/user-plans', userPlansRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
