import { pool } from '../config/db.js';

const MAX_DETAIL_CHARS = 4000;

function truncate(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? null);
  if (!text) return null;
  return text.length > MAX_DETAIL_CHARS ? `${text.slice(0, MAX_DETAIL_CHARS)}…` : text;
}

/**
 * Records one admin write. Never throws: a failed audit insert must not roll back
 * or block the mutation the admin actually requested.
 */
export async function recordAdminAction(req, { action, entity, entityId = null, detail = null }) {
  const actor = req?.user;
  if (!actor?.id) return;
  try {
    await pool.execute(
      `INSERT INTO admin_audit_log (actor_id, actor_email, action, entity, entity_id, detail, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        actor.id,
        String(actor.email || '').slice(0, 191),
        String(action).slice(0, 40),
        String(entity).slice(0, 60),
        entityId === null || entityId === undefined ? null : String(entityId).slice(0, 60),
        truncate(detail),
        String(req.ip || '').slice(0, 64) || null
      ]
    );
  } catch {}
}

export async function listAdminAuditLog({ limit = 100 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const [rows] = await pool.execute(
    `SELECT id, actor_id, actor_email, action, entity, entity_id, detail, ip, created_at
     FROM admin_audit_log ORDER BY id DESC LIMIT ${safeLimit}`
  );
  return rows;
}
