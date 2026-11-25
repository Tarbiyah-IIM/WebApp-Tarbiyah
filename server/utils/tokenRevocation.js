import { pool } from '../config/db.js';

/**
 * Access-token revocation cutoffs stored in MySQL so every Node worker honours
 * them. A missing row means the user has no active cutoff.
 */
export async function markUserAccessTokensRevoked(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) return;
  try {
    await pool.execute(
      `INSERT INTO access_token_revocations (user_id, revoked_before)
       VALUES (?, NOW())
       ON DUPLICATE KEY UPDATE revoked_before = NOW()`,
      [id]
    );
  } catch {}
}

export async function isAccessTokenRevoked(userId, issuedAtSeconds) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) return false;
  const issuedAt = Number(issuedAtSeconds);
  if (!Number.isFinite(issuedAt)) return true;
  try {
    // UNIX_TIMESTAMP() would reinterpret the stored UTC wall clock in the session
    // timezone; TIMESTAMPDIFF against NOW() avoids that double conversion.
    const [rows] = await pool.execute(
      'SELECT TIMESTAMPDIFF(SECOND, revoked_before, NOW()) AS ageSeconds FROM access_token_revocations WHERE user_id = ? LIMIT 1',
      [id]
    );
    if (!rows.length) return false;
    const ageSeconds = Number(rows[0].ageSeconds);
    if (!Number.isFinite(ageSeconds)) return true;
    return issuedAt < Math.floor(Date.now() / 1000) - ageSeconds;
  } catch {
    // Fail closed: if the cutoff cannot be read, reject rather than trust the token.
    return true;
  }
}

export async function clearAccessTokenRevocations() {
  try {
    await pool.execute('DELETE FROM access_token_revocations');
  } catch {}
}

export function isCookieTokenString(value) {
  return typeof value === 'string' && value.length > 0;
}
