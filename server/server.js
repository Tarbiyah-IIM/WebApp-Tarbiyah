import app from './app.js';
import { pool } from './config/db.js';
import { env } from './config/env.js';
import { purgeExpiredAuthTokens } from './models/user.model.js';

const TOKEN_PURGE_INTERVAL_MS = 6 * 60 * 60 * 1000;

async function start() {
  await pool.query('SELECT 1');
  if (env.nodeEnv !== 'test') {
    purgeExpiredAuthTokens().catch(() => {});
  }

  const server = app.listen(env.port, '0.0.0.0', () => {
    console.log(
      `Tarbiyah API listening on 0.0.0.0:${env.port} (PORT env: ${process.env.PORT ?? 'unset'})`
    );
  });

  const purgeTimer =
    env.nodeEnv !== 'test'
      ? setInterval(() => {
          purgeExpiredAuthTokens().catch(() => {});
        }, TOKEN_PURGE_INTERVAL_MS)
      : null;
  if (purgeTimer?.unref) {
    purgeTimer.unref();
  }

  let shuttingDown = false;
  const gracefulShutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`Received ${signal}, closing Tarbiyah API gracefully...`);
    if (purgeTimer) clearInterval(purgeTimer);
    server.close(async () => {
      try {
        await pool.end();
      } catch {}
      process.exit(0);
    });
    server.closeIdleConnections?.();
    setTimeout(() => {
      process.exit(1);
    }, 10000).unref();
  };

  process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.once('SIGINT', () => gracefulShutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Failed to start Tarbiyah API:', err?.message || err);
  process.exit(1);
});
