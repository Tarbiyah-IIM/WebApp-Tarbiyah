import { pool } from '../config/db.js';

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, password_hash, role, avatar_url, bio, is_active, created_at FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, role, avatar_url, bio, is_active, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

export async function createUser({ name, email, passwordHash, role = 'student', avatarUrl = null }) {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, role, avatarUrl]
  );
  return findUserById(result.insertId);
}

export async function updateUserProfile(id, { name, avatarUrl, bio }) {
  await pool.execute(
    'UPDATE users SET name = ?, avatar_url = ?, bio = ? WHERE id = ?',
    [name, avatarUrl, bio, id]
  );
  await pool.execute(
    'UPDATE mentors SET name = ?, bio = COALESCE(?, bio), photo_url = COALESCE(?, photo_url) WHERE user_id = ?',
    [name, bio, avatarUrl, id]
  );
  return findUserById(id);
}

export async function updateUserPassword(id, passwordHash) {
  await pool.execute(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [passwordHash, id]
  );
}

export async function deleteUserById(id) {
  const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function listUsersAdmin() {
  const [rows] = await pool.execute(
    `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.is_active, u.created_at,
            (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id) AS enrolled_courses,
            (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id AND o.status = 'paid') AS paid_orders
     FROM users u
     ORDER BY u.created_at DESC`
  );
  return rows;
}

export async function updateUserRoleAndStatusAdmin(id, { role, isActive }) {
  await pool.execute(
    'UPDATE users SET role = ?, is_active = ? WHERE id = ?',
    [role, isActive ? 1 : 0, id]
  );
  if (role === 'mentor') {
    const user = await findUserById(id);
    if (user) {
      const [existing] = await pool.execute('SELECT id FROM mentors WHERE user_id = ? LIMIT 1', [id]);
      if (existing.length === 0) {
        await pool.execute(
          'INSERT INTO mentors (user_id, name, title, bio, photo_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
          [user.id, user.name, 'Industry Mentor', user.bio || 'Industry practitioner on Meekoo.', user.avatar_url, 99]
        );
      }
    }
  }
  return findUserById(id);
}

export async function storeRefreshToken({ userId, tokenHash, expiresAt }) {
  await pool.execute(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, tokenHash, expiresAt]
  );
}

export async function findValidRefreshToken(tokenHash) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1',
    [tokenHash]
  );
  return rows[0] || null;
}

export async function revokeRefreshToken(tokenHash) {
  await pool.execute(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL',
    [tokenHash]
  );
}

export async function revokeAllUserRefreshTokens(userId) {
  await pool.execute(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL',
    [userId]
  );
}

export async function createPasswordReset({ userId, tokenHash, expiresAt }) {
  await pool.execute(
    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, tokenHash, expiresAt]
  );
}

export async function findValidPasswordReset(tokenHash) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW() LIMIT 1',
    [tokenHash]
  );
  return rows[0] || null;
}

export async function markPasswordResetUsed(id) {
  await pool.execute('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [id]);
}
