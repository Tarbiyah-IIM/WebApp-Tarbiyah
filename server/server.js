import app from './app.js';
import { pool } from './config/db.js';
import { env } from './config/env.js';

async function start() {
  await pool.query('SELECT 1');
  app.listen(env.port, '0.0.0.0', () => {
    console.log(
      `Tarbiyah API listening on 0.0.0.0:${env.port} (PORT env: ${process.env.PORT ?? 'unset'})`
    );
  });
}

start().catch((err) => {
  console.error('Failed to start Tarbiyah API:', err?.message || err);
  process.exit(1);
});
