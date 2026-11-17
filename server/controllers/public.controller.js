import { getCache, setCache } from '../config/cache.js';
import { AppError } from '../middlewares/error.middleware.js';
import {
  findCourseBySlug,
  getCourseCurriculum,
  listCategories,
  listMentors,
  listPublishedCourses
} from '../models/course.model.js';
import { createSubscriber, getLandingData } from '../models/landing.model.js';
import { getCourseReviews, hasCourseAccess, verifyCertificateByCode } from '../models/learning.model.js';

export async function getLanding(_req, res, next) {
  try {
    const cached = getCache('landing_bundle');
    if (cached) {
      return res.json(cached);
    }
    const data = await getLandingData();
    setCache('landing_bundle', data, 60000);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export async function getCategories(_req, res, next) {
  try {
    const categories = await listCategories();
    return res.json({ items: categories });
  } catch (err) {
    return next(err);
  }
}

export async function getMentors(_req, res, next) {
  try {
    const mentors = await listMentors();
    return res.json({ items: mentors });
  } catch (err) {
    return next(err);
  }
}

export async function getCourses(req, res, next) {
  try {
    const { category, q, level, page, limit } = req.validatedQuery || req.query;
    const result = await listPublishedCourses({
      category: category || '',
      q: q || '',
      level: level || '',
      page: Number(page || 1),
      limit: Number(limit || 6)
    });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

export async function getCourseDetail(req, res, next) {
  try {
    const course = await findCourseBySlug(req.params.slug);
    if (!course || !course.is_published || course.approval_status !== 'approved') {
      return next(new AppError(404, 'COURSE_NOT_FOUND', 'Kursus tidak ditemukan'));
    }

    let hasAccess = false;
    if (req.user) {
      if (req.user.role === 'admin' || (req.user.role === 'mentor' && course.mentor_user_id === req.user.id)) {
        hasAccess = true;
      } else {
        const access = await hasCourseAccess(req.user.id, course.id);
        hasAccess = access.allowed;
      }
    }

    const [curriculum, reviews] = await Promise.all([
      getCourseCurriculum(course.id, hasAccess),
      getCourseReviews(course.id)
    ]);

    return res.json({
      course,
      curriculum,
      reviews,
      hasAccess
    });
  } catch (err) {
    return next(err);
  }
}

export async function subscribeNewsletter(req, res, next) {
  try {
    const email = req.body.email.trim().toLowerCase();
    const source = req.body.source || 'footer';
    const result = await createSubscriber({ email, source });
    return res.status(result.alreadySubscribed ? 200 : 201).json({
      message: result.alreadySubscribed
        ? 'Email Anda sudah terdaftar di newsletter Meekoo.'
        : 'Terima kasih! Anda berhasil berlangganan pembaruan Meekoo.',
      subscriber: result
    });
  } catch (err) {
    return next(err);
  }
}

export async function verifyCertificate(req, res, next) {
  try {
    const cert = await verifyCertificateByCode(req.params.code.trim());
    if (!cert) {
      return next(new AppError(404, 'CERTIFICATE_NOT_FOUND', 'Kode sertifikat tidak ditemukan'));
    }
    return res.json({ valid: true, certificate: cert });
  } catch (err) {
    return next(err);
  }
}
