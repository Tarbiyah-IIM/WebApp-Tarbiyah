import app from './app.js';
import { pool } from './config/db.js';
import { env } from './config/env.js';

async function start() {
  await pool.query('SELECT 1');
  app.listen(env.port, () => {
    console.log(`Meekoo API listening on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start Meekoo API:', err?.message || err);
  process.exit(1);
});
