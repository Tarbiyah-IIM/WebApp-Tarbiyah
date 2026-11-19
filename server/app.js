import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'tarbiyah-api' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', publicRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
