import crypto from 'node:crypto';
import { pool } from '../config/db.js';

const MEDIA_URL_PATTERN = /^\/api\/v1\/media\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function extractMediaId(url) {
  if (typeof url !== 'string') return null;
  const match = url.trim().match(MEDIA_URL_PATTERN);
  return match ? match[1] : null;
}

export function isValidMediaId(id) {
  return typeof id === 'string' && UUID_PATTERN.test(id);
}

export async function createMediaFile({ originalName, mimeType, data, uploadedBy = null }) {
  const id = crypto.randomUUID();
  const safeName = String(originalName || 'image').slice(0, 255);
  await pool.execute(
    'INSERT INTO media_files (id, original_name, mime_type, size_bytes, data, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
    [id, safeName, mimeType, data.length, data, uploadedBy]
  );
  return {
    id,
    mimeType,
    sizeBytes: data.length,
    url: `/api/v1/media/${id}`
  };
}

export async function findMediaFileById(id) {
  if (!isValidMediaId(id)) return null;
  const [rows] = await pool.execute(
    'SELECT id, mime_type, size_bytes, data, created_at FROM media_files WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

function parseGalleryUrlsList(raw) {
  if (Array.isArray(raw)) return raw.filter((item) => typeof item === 'string' && item.trim());
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === 'string' && item.trim())
      : [];
  } catch {
    return [];
  }
}

export async function findTestimonialMediaUrls(testimonialId) {
  const [rows] = await pool.execute(
    'SELECT avatar_url, gallery_urls FROM testimonials WHERE id = ? LIMIT 1',
    [testimonialId]
  );
  const row = rows[0];
  if (!row) return [];
  const urls = [];
  if (row.avatar_url) urls.push(row.avatar_url);
  for (const galleryUrl of parseGalleryUrlsList(row.gallery_urls)) {
    urls.push(galleryUrl);
  }
  return Array.from(new Set(urls));
}

export async function findAgendaMediaUrls(agendaId) {
  const [rows] = await pool.execute('SELECT cover_url FROM agendas WHERE id = ? LIMIT 1', [agendaId]);
  const coverUrl = rows[0]?.cover_url;
  return coverUrl ? [coverUrl] : [];
}

export async function deleteMediaFileIfUnreferenced(mediaId) {
  if (!isValidMediaId(mediaId)) return false;
  const pattern = `%/api/v1/media/${mediaId}%`;
  const [[usage]] = await pool.execute(
    `SELECT
      (SELECT COUNT(*) FROM testimonials WHERE avatar_url LIKE ? OR gallery_urls LIKE ?) +
      (SELECT COUNT(*) FROM agendas WHERE cover_url LIKE ?) +
      (SELECT COUNT(*) FROM site_settings WHERE setting_value LIKE ?) AS refCount`,
    [pattern, pattern, pattern, pattern]
  );
  if (Number(usage?.refCount || 0) > 0) {
    return false;
  }
  const [result] = await pool.execute('DELETE FROM media_files WHERE id = ?', [mediaId]);
  return result.affectedRows > 0;
}
