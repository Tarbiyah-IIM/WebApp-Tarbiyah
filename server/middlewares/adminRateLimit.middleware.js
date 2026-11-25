import rateLimit from 'express-rate-limit';

function writeLimiterResponse(message) {
  return { error: { code: 'RATE_LIMITED', message, details: [] } };
}

const adminWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: writeLimiterResponse('Terlalu banyak perubahan data admin dalam satu menit. Silakan tunggu sebentar.')
});

const adminUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: writeLimiterResponse('Terlalu banyak unggahan media dari akun ini. Silakan coba lagi beberapa menit lagi.')
});

export { adminWriteLimiter, adminUploadLimiter };

/**
 * Applies a limiter to POST/PATCH/PUT/DELETE requests and lets reads pass through
 * untouched, so admin list endpoints keep their previous behaviour.
 */
export function limitWrites(limiter) {
  return (req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
    return limiter(req, res, next);
  };
}
