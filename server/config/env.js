import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tarbiyah_iim'
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresDays: Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 7)
  },
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'dev-webhook-secret',
  pplWorkPermitScriptUrl:
    process.env.PPL_WORK_PERMIT_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycby1rCchHW3F8zUOI7TMMBEZDRSRxG1px1eqUgJJevYtowXI6CT4_imYY0Llvz6KQxJvWw/exec'
};
