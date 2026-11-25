import { pool } from './db.js';

/**
 * Shared cache backed by MySQL so every Node worker sees the same entries.
 * Falls back to no caching if the table is unavailable, never to a stale value.
 */
export async function getCache(key) {
  try {
    const [rows] = await pool.execute(
      'SELECT cache_value FROM app_cache WHERE cache_key = ? AND expires_at > UTC_TIMESTAMP() LIMIT 1',
      [key]
    );
    if (!rows.length) return null;
    const raw = rows[0].cache_value;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCache(key, value, ttlMs = 60000) {
  if (value === null || value === undefined || ttlMs <= 0) {
    await clearCache(key);
    return;
  }
  try {
    await pool.execute(
      `INSERT INTO app_cache (cache_key, cache_value, expires_at)
       VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? SECOND))
       ON DUPLICATE KEY UPDATE cache_value = VALUES(cache_value), expires_at = VALUES(expires_at)`,
      [key, JSON.stringify(value), Math.max(1, Math.ceil(ttlMs / 1000))]
    );
  } catch {
    // Cache is an optimization: a write failure must never break the request.
  }
}

export async function clearCache(key) {
  try {
    await pool.execute('DELETE FROM app_cache WHERE cache_key = ?', [key]);
  } catch {}
}

export async function clearCacheByPrefix(prefix) {
  try {
    await pool.execute('DELETE FROM app_cache WHERE cache_key LIKE ?', [`${prefix}%`]);
  } catch {}
}

export async function purgeExpiredCache() {
  try {
    await pool.execute('DELETE FROM app_cache WHERE expires_at <= UTC_TIMESTAMP()');
  } catch {}
}

let landingCacheGeneration = 0;

export function getLandingCacheGeneration() {
  return landingCacheGeneration;
}

export async function invalidateLandingCache() {
  landingCacheGeneration += 1;
  await clearCache('landing_bundle');
  await clearCacheByPrefix('news_detail_');
}
