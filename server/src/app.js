import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import budgetsRoutes from './modules/budgets/budgets.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import notesRoutes from './modules/notes/notes.routes.js';
import plansRoutes from './modules/plans/plans.routes.js';
import reflectionsRoutes from './modules/reflections/reflections.routes.js';
import transactionsRoutes from './modules/transactions/transactions.routes.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({ success: true, status: 'ok' });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/categories', categoriesRoutes);
  app.use('/api/v1/plans/:id/budgets', budgetsRoutes);
  app.use('/api/v1/plans', plansRoutes);
  app.use('/api/v1/transactions', transactionsRoutes);
  app.use('/api/v1/notes', notesRoutes);
  app.use('/api/v1/monthly-reflections', reflectionsRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);

  app.use('/api', (_req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found.' });
  });

  app.use(errorHandler);

  return app;
}
