import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { deleteMe, getMe, updateMe } from '../controllers/auth.controller.js';
import { getGuestLectureData, submitGuestLecture } from '../controllers/guestLecture.controller.js';
import { getWorkPermitMeta, submitWorkPermit } from '../controllers/permit.controller.js';
import { getLanding, getPublicLecturers, getPublicMedia, getPublicNewsDetail, subscribeNewsletter } from '../controllers/public.controller.js';
import { env } from '../config/env.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { AppError } from '../middlewares/error.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { guestLectureSubmitSchema, pplWorkPermitSchema, subscribeSchema, updateProfileSchema } from '../validators/schemas.js';

const router = Router();

const relayReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Terlalu banyak permintaan data layanan, silakan tunggu sebentar',
      details: []
    }
  }
});

const relayWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Terlalu banyak pengiriman formulir, silakan coba lagi beberapa menit lagi',
      details: []
    }
  }
});

const mediaReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 240,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Terlalu banyak permintaan media, silakan tunggu sebentar',
      details: []
    }
  }
});

const publicReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Terlalu banyak permintaan data halaman, silakan tunggu sebentar',
      details: []
    }
  }
});

const profileWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Terlalu banyak pembaruan profil, silakan tunggu beberapa menit lagi',
      details: []
    }
  }
});

function ensureSubscribersEnabled(_req, _res, next) {
  if (!env.allowPublicRegister) {
    return next(new AppError(403, 'ENDPOINT_DISABLED', 'Endpoint pendaftaran newsletter dinonaktifkan'));
  }
  return next();
}

router.get('/landing', publicReadLimiter, getLanding);
router.get('/lecturers', publicReadLimiter, getPublicLecturers);
router.get('/news/:id', publicReadLimiter, getPublicNewsDetail);
router.get('/media/:id', mediaReadLimiter, getPublicMedia);
router.post('/subscribers', ensureSubscribersEnabled, relayWriteLimiter, validateBody(subscribeSchema), subscribeNewsletter);
router.get('/permits/work-permit/meta', relayReadLimiter, getWorkPermitMeta);
router.post('/permits/work-permit', relayWriteLimiter, validateBody(pplWorkPermitSchema), submitWorkPermit);
router.get('/guest-lectures', relayReadLimiter, getGuestLectureData);
router.post('/guest-lectures', relayWriteLimiter, validateBody(guestLectureSubmitSchema), submitGuestLecture);

router.get('/me', authenticate, getMe);
router.patch('/me', profileWriteLimiter, authenticate, validateBody(updateProfileSchema), updateMe);
router.delete('/me', authenticate, deleteMe);

export default router;
