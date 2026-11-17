import crypto from 'node:crypto';
import { invalidateLandingCache } from '../config/cache.js';
import { AppError } from '../middlewares/error.middleware.js';
import {
  createCategory,
  createCourse,
  createLesson,
  createMentor,
  createSection,
  deleteCategory,
  deleteCourse,
  deleteLesson,
  deleteMentor,
  deleteSection,
  findCourseById,
  getCourseCurriculum,
  listAllCoursesAdmin,
  listCategories,
  listMentors,
  updateCategory,
  updateCourse,
  updateLesson,
  updateMentor,
  updateSection
} from '../models/course.model.js';
import { createLiveSession, deleteLiveSession, listLiveSessions } from '../models/fase2.model.js';
import {
  createFaq,
  createFeature,
  createPartner,
  createStat,
  createTestimonial,
  deleteFaq,
  deleteFeature,
  deletePartner,
  deleteStat,
  deleteTestimonial,
  getSettingsMap,
  listFaqsAdmin,
  listFeaturesAdmin,
  listPartnersAdmin,
  listStatsAdmin,
  listTestimonialsAdmin,
  updateFaq,
  updateFeature,
  updatePartner,
  updateStat,
  updateTestimonial,
  upsertSettings
} from '../models/landing.model.js';
import {
  getAdminOverviewStats,
  listAdminOrders,
  processPaymentWebhookTransactional
} from '../models/order.model.js';
import { listUsersAdmin, updateUserRoleAndStatusAdmin } from '../models/user.model.js';

function slugify(title) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
  return `${base || 'course'}-${crypto.randomBytes(2).toString('hex')}`;
}

export async function getAdminOverview(_req, res, next) {
  try {
    const stats = await getAdminOverviewStats();
    return res.json({ stats });
  } catch (err) {
    return next(err);
  }
}

export async function adminListUsers(_req, res, next) {
  try {
    const items = await listUsersAdmin();
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateUser(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user.id && req.body.role !== 'admin') {
      return next(new AppError(400, 'SELF_DEMOTE_FORBIDDEN', 'Tidak dapat menurunkan peran akun admin yang sedang digunakan'));
    }
    const user = await updateUserRoleAndStatusAdmin(targetId, req.body);
    if (!user) {
      return next(new AppError(404, 'USER_NOT_FOUND', 'Pengguna tidak ditemukan'));
    }
    invalidateLandingCache();
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

export async function adminListOrders(_req, res, next) {
  try {
    const items = await listAdminOrders();
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateOrderStatus(req, res, next) {
  try {
    const status = req.body.status === 'failed' ? 'failed' : 'paid';
    const order = await processPaymentWebhookTransactional({
      orderId: Number(req.params.id),
      status,
      gatewayRef: `ADM-${Date.now()}`
    });
    if (!order) {
      return next(new AppError(404, 'ORDER_NOT_FOUND', 'Pesanan tidak ditemukan'));
    }
    return res.json({ order });
  } catch (err) {
    return next(err);
  }
}

export async function adminListCourses(_req, res, next) {
  try {
    const items = await listAllCoursesAdmin();
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}

export async function adminGetCourseCurriculum(req, res, next) {
  try {
    const course = await findCourseById(Number(req.params.id));
    if (!course) {
      return next(new AppError(404, 'COURSE_NOT_FOUND', 'Kursus tidak ditemukan'));
    }
    const curriculum = await getCourseCurriculum(course.id, true);
    return res.json({ course, curriculum });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateCourse(req, res, next) {
  try {
    const payload = req.body;
    const course = await createCourse({
      categoryId: payload.categoryId,
      mentorId: payload.mentorId || 1,
      title: payload.title,
      slug: payload.slug || slugify(payload.title),
      subtitle: payload.subtitle,
      description: payload.description,
      level: payload.level,
      price: payload.price,
      currency: payload.currency,
      thumbnailUrl: payload.thumbnailUrl || null,
      badge: payload.badge || null,
      approvalStatus: payload.approvalStatus || 'approved',
      isPublished: payload.isPublished !== undefined ? payload.isPublished : true
    });
    invalidateLandingCache();
    return res.status(201).json({ course });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateCourse(req, res, next) {
  try {
    const existing = await findCourseById(Number(req.params.id));
    if (!existing) {
      return next(new AppError(404, 'COURSE_NOT_FOUND', 'Kursus tidak ditemukan'));
    }
    const payload = req.body;
    const course = await updateCourse(existing.id, {
      categoryId: payload.categoryId,
      mentorId: payload.mentorId || existing.mentor_id,
      title: payload.title,
      slug: payload.slug || existing.slug,
      subtitle: payload.subtitle,
      description: payload.description,
      level: payload.level,
      price: payload.price,
      currency: payload.currency,
      thumbnailUrl: payload.thumbnailUrl !== undefined ? payload.thumbnailUrl : existing.thumbnail_url,
      badge: payload.badge !== undefined ? payload.badge : existing.badge,
      approvalStatus: payload.approvalStatus || existing.approval_status,
      isPublished: payload.isPublished !== undefined ? payload.isPublished : Boolean(existing.is_published)
    });
    invalidateLandingCache();
    return res.json({ course });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteCourse(req, res, next) {
  try {
    const ok = await deleteCourse(Number(req.params.id));
    if (!ok) {
      return next(new AppError(404, 'COURSE_NOT_FOUND', 'Kursus tidak ditemukan'));
    }
    invalidateLandingCache();
    return res.json({ message: 'Kursus dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateSection(req, res, next) {
  try {
    const section = await createSection({
      courseId: Number(req.body.courseId),
      title: req.body.title,
      sortOrder: req.body.sortOrder
    });
    return res.status(201).json({ section });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateSection(req, res, next) {
  try {
    const section = await updateSection(Number(req.params.id), req.body);
    if (!section) return next(new AppError(404, 'SECTION_NOT_FOUND', 'Bab tidak ditemukan'));
    return res.json({ section });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteSection(req, res, next) {
  try {
    const ok = await deleteSection(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'SECTION_NOT_FOUND', 'Bab tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'Bab dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateLesson(req, res, next) {
  try {
    const lesson = await createLesson(req.body);
    if (!lesson) return next(new AppError(404, 'SECTION_NOT_FOUND', 'Bab tidak ditemukan'));
    invalidateLandingCache();
    return res.status(201).json({ lesson });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateLesson(req, res, next) {
  try {
    const lesson = await updateLesson(Number(req.params.id), req.body);
    if (!lesson) return next(new AppError(404, 'LESSON_NOT_FOUND', 'Pelajaran tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ lesson });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteLesson(req, res, next) {
  try {
    const ok = await deleteLesson(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'LESSON_NOT_FOUND', 'Pelajaran tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'Pelajaran dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListCategories(_req, res, next) {
  try {
    return res.json({ items: await listCategories() });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateCategory(req, res, next) {
  try {
    const item = await createCategory(req.body);
    invalidateLandingCache();
    return res.status(201).json({ category: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateCategory(req, res, next) {
  try {
    const item = await updateCategory(Number(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'CATEGORY_NOT_FOUND', 'Kategori tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ category: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteCategory(req, res, next) {
  try {
    const ok = await deleteCategory(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'CATEGORY_NOT_FOUND', 'Kategori tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'Kategori dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListMentors(_req, res, next) {
  try {
    return res.json({ items: await listMentors({ includeInactive: true }) });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateMentor(req, res, next) {
  try {
    const mentor = await createMentor(req.body);
    invalidateLandingCache();
    return res.status(201).json({ mentor });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateMentor(req, res, next) {
  try {
    const mentor = await updateMentor(Number(req.params.id), req.body);
    if (!mentor) return next(new AppError(404, 'MENTOR_NOT_FOUND', 'Mentor tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ mentor });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteMentor(req, res, next) {
  try {
    const ok = await deleteMentor(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'MENTOR_NOT_FOUND', 'Mentor tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'Mentor dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListTestimonials(_req, res, next) {
  try {
    return res.json({ items: await listTestimonialsAdmin() });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateTestimonial(req, res, next) {
  try {
    const item = await createTestimonial(req.body);
    invalidateLandingCache();
    return res.status(201).json({ testimonial: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateTestimonial(req, res, next) {
  try {
    const item = await updateTestimonial(Number(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Testimoni tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ testimonial: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteTestimonial(req, res, next) {
  try {
    const ok = await deleteTestimonial(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Testimoni tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'Testimoni dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListFaqs(_req, res, next) {
  try {
    return res.json({ items: await listFaqsAdmin() });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateFaq(req, res, next) {
  try {
    const item = await createFaq(req.body);
    invalidateLandingCache();
    return res.status(201).json({ faq: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateFaq(req, res, next) {
  try {
    const item = await updateFaq(Number(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'FAQ tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ faq: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteFaq(req, res, next) {
  try {
    const ok = await deleteFaq(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'FAQ tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'FAQ dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListStats(_req, res, next) {
  try {
    return res.json({ items: await listStatsAdmin() });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateStat(req, res, next) {
  try {
    const item = await createStat(req.body);
    invalidateLandingCache();
    return res.status(201).json({ stat: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateStat(req, res, next) {
  try {
    const item = await updateStat(Number(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Statistik tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ stat: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteStat(req, res, next) {
  try {
    const ok = await deleteStat(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Statistik tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'Statistik dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListFeatures(_req, res, next) {
  try {
    return res.json({ items: await listFeaturesAdmin() });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateFeature(req, res, next) {
  try {
    const item = await createFeature(req.body);
    invalidateLandingCache();
    return res.status(201).json({ feature: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateFeature(req, res, next) {
  try {
    const item = await updateFeature(Number(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Fitur tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ feature: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteFeature(req, res, next) {
  try {
    const ok = await deleteFeature(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Fitur tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'Fitur dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListPartners(_req, res, next) {
  try {
    return res.json({ items: await listPartnersAdmin() });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreatePartner(req, res, next) {
  try {
    const item = await createPartner(req.body);
    invalidateLandingCache();
    return res.status(201).json({ partner: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdatePartner(req, res, next) {
  try {
    const item = await updatePartner(Number(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Mitra tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ partner: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeletePartner(req, res, next) {
  try {
    const ok = await deletePartner(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Mitra tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'Mitra dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminGetSettings(_req, res, next) {
  try {
    return res.json({ settings: await getSettingsMap() });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateSettings(req, res, next) {
  try {
    const settings = await upsertSettings(req.body);
    invalidateLandingCache();
    return res.json({ settings });
  } catch (err) {
    return next(err);
  }
}

export async function adminListLiveSessions(_req, res, next) {
  try {
    return res.json({ items: await listLiveSessions({}) });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateLiveSession(req, res, next) {
  try {
    const course = await findCourseById(Number(req.body.courseId));
    if (!course) return next(new AppError(404, 'COURSE_NOT_FOUND', 'Kursus tidak ditemukan'));
    const session = await createLiveSession({
      courseId: course.id,
      mentorId: req.body.mentorId || course.mentor_id,
      title: req.body.title,
      description: req.body.description,
      startsAt: req.body.startsAt,
      durationMin: req.body.durationMin,
      platform: req.body.platform,
      meetingUrl: req.body.meetingUrl
    });
    return res.status(201).json({ session });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteLiveSession(req, res, next) {
  try {
    const ok = await deleteLiveSession(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'SESSION_NOT_FOUND', 'Sesi live tidak ditemukan'));
    return res.json({ message: 'Sesi live dihapus' });
  } catch (err) {
    return next(err);
  }
}

export function adminUploadImage(req, res, next) {
  if (!req.file) {
    return next(new AppError(400, 'NO_FILE', 'File gambar tidak ditemukan'));
  }
  return res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename
  });
}
