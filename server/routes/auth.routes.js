import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resetPassword
} from '../controllers/auth.controller.js';
import { env } from '../config/env.js';
import { AppError } from '../middlewares/error.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema
} from '../validators/schemas.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Terlalu banyak percobaan autentikasi, coba lagi beberapa menit lagi',
      details: []
    }
  }
});

const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Terlalu banyak permintaan sesi, coba lagi beberapa saat lagi',
      details: []
    }
  }
});

function ensurePublicRegisterEnabled(_req, _res, next) {
  if (!env.allowPublicRegister) {
    return next(new AppError(403, 'REGISTRATION_DISABLED', 'Pendaftaran akun publik dinonaktifkan'));
  }
  return next();
}

router.post('/register', ensurePublicRegisterEnabled, authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/refresh', sessionLimiter, refresh);
router.post('/logout', sessionLimiter, logout);
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), resetPassword);

export default router;
