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
  'secret',
  'changeme'
]);

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

function resolveJwtAccessSecret() {
  const raw = String(process.env.JWT_ACCESS_SECRET || '').trim();
  if (isProduction) {
    if (raw.length < 32 || INSECURE_DEFAULT_SECRETS.has(raw.toLowerCase())) {
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
  .map((item) => item.trim())
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT || 3001),
  nodeEnv,
  clientOrigin: clientOrigins[0] || 'http://localhost:5173',
  clientOrigins,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tarbiyah_iim'
  },
  jwt: {
    accessSecret: resolveJwtAccessSecret(),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresDays: Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 7)
  },
  pplWorkPermitScriptUrl:
    process.env.PPL_WORK_PERMIT_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycby1rCchHW3F8zUOI7TMMBEZDRSRxG1px1eqUgJJevYtowXI6CT4_imYY0Llvz6KQxJvWw/exec',
  guestLectureScriptUrl:
    process.env.GUEST_LECTURE_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbwjx4f_R-H4MXwGpjMyI8X-BpGKASOTfkuwqMWp1JkjcvPRYyhiI9C00gMQTp351LHo/exec',
  appsScriptRelaySecret: String(process.env.APPS_SCRIPT_RELAY_SECRET || '').trim(),
  allowPublicRegister: nodeEnv === 'test' && process.env.ALLOW_PUBLIC_REGISTER === 'true',
  allowSandboxReset: nodeEnv === 'test' && process.env.ALLOW_SANDBOX_RESET === 'true'
};
