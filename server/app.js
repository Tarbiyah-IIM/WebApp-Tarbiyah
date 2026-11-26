import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { pool } from './config/db.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { requestLoggingMiddleware } from './utils/logger.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', env.trustProxy);
app.use(requestLoggingMiddleware);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        frameSrc: [
          "'self'",
          'https://drive.google.com',
          'https://docs.google.com',
          'https://script.google.com',
          'https://*.googleusercontent.com',
          'https://www.google.com/maps',
          'https://www.google.com/maps/',
          'https://maps.google.com',
          'https://maps.google.com/'
        ],
        ...(env.nodeEnv === 'production' ? {} : { upgradeInsecureRequests: null })
      }
    }
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true
  })
);
// Route-specific body limit must be mounted before the global parser, otherwise
// the 1mb global limit rejects guest-lecture photo payloads before it is reached.
app.use('/api/v1/guest-lectures', express.json({ limit: '10mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/v1/health', async (_req, res) => {
  const startedAt = Date.now();
  let database = 'down';
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    database = rows?.[0]?.ok === 1 ? 'up' : 'down';
  } catch {
    database = 'down';
  }
  const healthy = database === 'up';
  return res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'tarbiyah-api',
    database,
    appScriptRelay: env.appsScriptRelaySecret ? 'configured' : 'missing',
    latencyMs: Date.now() - startedAt
  });
});

app.get('/api/v1/health/ready', async (_req, res) => {
  const checks = { database: false, relay: Boolean(env.appsScriptRelaySecret) };
  try {
    await pool.query('SELECT 1');
    checks.database = true;
  } catch {
    checks.database = false;
  }
  const ready = checks.database && (env.nodeEnv !== 'production' || checks.relay);
  return res.status(ready ? 200 : 503).json({ ready, checks });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', publicRoutes);
app.use('/api/v1/admin', adminRoutes);

const SITEMAP_PATHS = [
  '/',
  '/program-studi/pai',
  '/program-studi/pai/dosen',
  '/program-studi/pgmi',
  '/program-studi/pgmi/dosen',
  '/program-studi/piaud',
  '/program-studi/piaud/dosen',
  '/akademik/administrasi-persuratan',
  '/akademik/ujian-komprehensif',
  '/publikasi/ppl',
  '/publikasi/pkn',
  '/publikasi/jurnal',
  '/kuliah-tamu',
  '/privacy'
];

// Built from the request host so the same build serves every deployment domain.
app.get('/sitemap.xml', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  const urls = SITEMAP_PATHS.map(
    (p) => `  <url><loc>${base}${p}</loc><changefreq>weekly</changefreq></url>`
  ).join('\n');
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
});

const distDir = path.resolve(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(
    '/assets',
    express.static(path.join(distDir, 'assets'), {
      maxAge: '1y',
      immutable: true
    })
  );
  app.use(
    express.static(distDir, {
      setHeaders(res, filePath) {
        if (path.basename(filePath) === 'index.html') {
          res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        }
      }
    })
  );
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api') || req.path.startsWith('/assets/')) return next();
    if (/\.[a-z0-9]{1,8}$/i.test(req.path)) return next();
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
