import app from './app.js';
import { pool } from './config/db.js';
import { logger } from './utils/logger.js';
import { purgeExpiredCache } from './config/cache.js';
import { env } from './config/env.js';
import { purgeExpiredAuthTokens } from './models/user.model.js';

const TOKEN_PURGE_INTERVAL_MS = 6 * 60 * 60 * 1000;

async function start() {
  await pool.query('SELECT 1');
  if (env.nodeEnv !== 'test') {
    purgeExpiredAuthTokens().catch(() => {});
    purgeExpiredCache().catch(() => {});
  }

  const server = app.listen(env.port, '0.0.0.0', () => {
    logger.info('server_listening', { port: env.port, nodeEnv: env.nodeEnv });
  });

  const purgeTimer =
    env.nodeEnv !== 'test'
      ? setInterval(() => {
          purgeExpiredAuthTokens().catch(() => {});
          purgeExpiredCache().catch(() => {});
        }, TOKEN_PURGE_INTERVAL_MS)
      : null;
  if (purgeTimer?.unref) {
    purgeTimer.unref();
  }

  let shuttingDown = false;
  const gracefulShutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info('graceful_shutdown_started', { signal });
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
  logger.error('server_start_failed', { message: err?.message || String(err) });
  process.exit(1);
});
