import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const DEV_EPHEMERAL_ACCESS_SECRET = crypto.randomBytes(32).toString('hex');
const INSECURE_DEFAULT_SECRETS = new Set([
  'dev-access-secret',
  'dev-refresh-secret',
  'dev-webhook-secret',
  'change_me_access_secret',
  'change_me_refresh_secret',
  'change_me_webhook_secret',
  'change_me_with_at_least_32_random_hex_chars',
  'secret',
  'changeme'
]);

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

export function resolveJwtAccessSecret(
  rawOverride = process.env.JWT_ACCESS_SECRET,
  targetNodeEnv = nodeEnv
) {
  const raw = String(rawOverride || '').trim();
  if (targetNodeEnv === 'production') {
    const looksPlaceholder = /^(change_me|changeme|dev-|replace_me)/i.test(raw);
    if (raw.length < 32 || looksPlaceholder || INSECURE_DEFAULT_SECRETS.has(raw.toLowerCase())) {
      throw new Error(
        '[FATAL] JWT_ACCESS_SECRET wajib diisi minimal 32 karakter acak yang aman saat NODE_ENV=production.'
      );
    }
    return raw;
  }
  return raw || DEV_EPHEMERAL_ACCESS_SECRET;
}

const clientOrigins = String(process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((item) => item.trim().replace(/\/+$/, '').toLowerCase())
  .filter(Boolean);

function parseBoundedInt(raw, fallback, min, max) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return fallback;
  return parsed;
}

export const env = {
  port: parseBoundedInt(process.env.PORT, 3001, 1, 65535),
  nodeEnv,
  trustProxy: parseBoundedInt(process.env.TRUST_PROXY_HOPS, 1, 0, 5),
  clientOrigin: clientOrigins[0] || 'http://localhost:5173',
  clientOrigins,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseBoundedInt(process.env.DB_PORT, 3306, 1, 65535),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tarbiyah_iim',
    connectionLimit: parseBoundedInt(process.env.DB_CONNECTION_LIMIT, 10, 1, 50)
  },
  jwt: {
    accessSecret: resolveJwtAccessSecret(),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresDays: parseBoundedInt(process.env.JWT_REFRESH_EXPIRES_DAYS, 7, 1, 90)
  },
  pplWorkPermitScriptUrl:
    process.env.PPL_WORK_PERMIT_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycby1rCchHW3F8zUOI7TMMBEZDRSRxG1px1eqUgJJevYtowXI6CT4_imYY0Llvz6KQxJvWw/exec',
  guestLectureScriptUrl:
    process.env.GUEST_LECTURE_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbwjx4f_R-H4MXwGpjMyI8X-BpGKASOTfkuwqMWp1JkjcvPRYyhiI9C00gMQTp351LHo/exec',
  hasPrivateGuestLectureUrl: Boolean(String(process.env.GUEST_LECTURE_SCRIPT_URL || '').trim()),
  appsScriptRelaySecret: String(process.env.APPS_SCRIPT_RELAY_SECRET || '').trim(),
  allowPublicRegister: nodeEnv === 'test' && process.env.ALLOW_PUBLIC_REGISTER === 'true',
  allowSandboxReset: nodeEnv === 'test' && process.env.ALLOW_SANDBOX_RESET === 'true'
};
