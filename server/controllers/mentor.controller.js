import crypto from 'node:crypto';
import { invalidateLandingCache } from '../config/cache.js';
import { AppError } from '../middlewares/error.middleware.js';
import {
  createCourse,
  createLesson,
  createMentor,
  createSection,
  deleteLesson,
  deleteSection,
  findCourseById,
  findLessonWithCourse,
  findMentorByUserId,
  findSectionWithCourse,
  getCourseCurriculum,
  listMentorCourses,
  updateCourse,
  updateLesson,
  updateSection
} from '../models/course.model.js';
import { createLiveSession, deleteLiveSession, findLiveSessionById, listLiveSessions } from '../models/fase2.model.js';
import { getMentorOverviewStats } from '../models/order.model.js';

function slugify(title) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
  return `${base || 'course'}-${crypto.randomBytes(2).toString('hex')}`;
}

async function resolveMentorForUser(user) {
  let mentor = await findMentorByUserId(user.id);
  if (!mentor) {
    mentor = await createMentor({
      userId: user.id,
      name: user.name,
      title: 'Industry Mentor',
      bio: user.bio || 'Industry practitioner on Meekoo.',
      photoUrl: user.avatar_url,
      sortOrder: 99,
      isActive: true
    });
  }
  return mentor;
}

export async function getMentorOverview(req, res, next) {
  try {
    const mentor = await resolveMentorForUser(req.user);
    const [stats, courses, sessions] = await Promise.all([
      getMentorOverviewStats(mentor.id),
      listMentorCourses(mentor.id),
      listLiveSessions({ mentorId: mentor.id })
    ]);
    return res.json({ mentor, stats, courses, sessions });
  } catch (err) {
    return next(err);
  }
}

export async function getMentorCourseCurriculum(req, res, next) {
  try {
    const mentor = await resolveMentorForUser(req.user);
    const course = await findCourseById(Number(req.params.id));
    if (!course || (course.mentor_id !== mentor.id && req.user.role !== 'admin')) {
      return next(new AppError(404, 'COURSE_NOT_FOUND', 'Kursus tidak ditemukan'));
    }
    const curriculum = await getCourseCurriculum(course.id, true);
    return res.json({ course, curriculum });
  } catch (err) {
    return next(err);
  }
}

export async function mentorCreateCourse(req, res, next) {
  try {
    const mentor = await resolveMentorForUser(req.user);
    const payload = req.body;
    const course = await createCourse({
      categoryId: payload.categoryId,
      mentorId: mentor.id,
      title: payload.title,
      slug: payload.slug || slugify(payload.title),
      subtitle: payload.subtitle,
      description: payload.description,
      level: payload.level,
      price: payload.price,
      currency: payload.currency,
      thumbnailUrl: payload.thumbnailUrl || null,
      badge: payload.badge || null,
      approvalStatus: payload.approvalStatus === 'pending_review' ? 'pending_review' : 'draft',
      isPublished: false
    });
    return res.status(201).json({ course });
  } catch (err) {
    return next(err);
  }
}

export async function mentorUpdateCourse(req, res, next) {
  try {
    const mentor = await resolveMentorForUser(req.user);
    const existing = await findCourseById(Number(req.params.id));
    if (!existing || (existing.mentor_id !== mentor.id && req.user.role !== 'admin')) {
      return next(new AppError(404, 'COURSE_NOT_FOUND', 'Kursus tidak ditemukan'));
    }

    const payload = req.body;
    const nextApproval = existing.approval_status === 'approved' ? 'approved' : (payload.approvalStatus || existing.approval_status);
    const nextPublished = existing.approval_status === 'approved' ? Boolean(existing.is_published) : false;

    const course = await updateCourse(existing.id, {
      categoryId: payload.categoryId,
      mentorId: existing.mentor_id,
      title: payload.title,
      slug: payload.slug || existing.slug,
      subtitle: payload.subtitle,
      description: payload.description,
      level: payload.level,
      price: payload.price,
      currency: payload.currency,
      thumbnailUrl: payload.thumbnailUrl !== undefined ? payload.thumbnailUrl : existing.thumbnail_url,
      badge: payload.badge !== undefined ? payload.badge : existing.badge,
      approvalStatus: nextApproval,
      isPublished: nextPublished
    });
    invalidateLandingCache();
    return res.json({ course });
  } catch (err) {
    return next(err);
  }
}

export async function mentorSubmitCourseForReview(req, res, next) {
  try {
    const mentor = await resolveMentorForUser(req.user);
    const existing = await findCourseById(Number(req.params.id));
    if (!existing || (existing.mentor_id !== mentor.id && req.user.role !== 'admin')) {
      return next(new AppError(404, 'COURSE_NOT_FOUND', 'Kursus tidak ditemukan'));
    }

    const course = await updateCourse(existing.id, {
      categoryId: existing.category_id,
      mentorId: existing.mentor_id,
      title: existing.title,
      slug: existing.slug,
      subtitle: existing.subtitle || '',
      description: existing.description,
      level: existing.level,
      price: existing.price,
      currency: existing.currency,
      thumbnailUrl: existing.thumbnail_url,
      badge: existing.badge,
      approvalStatus: 'pending_review',
      isPublished: false
    });
    return res.json({ course });
  } catch (err) {
    return next(err);
  }
}

export async function mentorCreateSection(req, res, next) {
  try {
    const mentor = await resolveMentorForUser(req.user);
    const course = await findCourseById(Number(req.body.courseId));
    if (!course || (course.mentor_id !== mentor.id && req.user.role !== 'admin')) {
      return next(new AppError(404, 'COURSE_NOT_FOUND', 'Kursus tidak ditemukan'));
    }
    const section = await createSection({
      courseId: course.id,
      title: req.body.title,
      sortOrder: req.body.sortOrder
    });
    return res.status(201).json({ section });
  } catch (err) {
    return next(err);
  }
}

export async function mentorUpdateSection(req, res, next) {
  try {
    const mentor = await resolveMentorForUser(req.user);
    const existing = await findSectionWithCourse(Number(req.params.id));
    if (!existing || (existing.mentor_id !== mentor.id && req.user.role !== 'admin')) {
      return next(new AppError(404, 'SECTION_NOT_FOUND', 'Bab tidak ditemukan'));
    }
    const section = await updateSection(existing.id, {
      title: req.body.title,
      sortOrder: req.body.sortOrder
    });
    return res.json({ section });
  } catch (err) {
    return next(err);
  }
}

export async function mentorDeleteSection(req, res, next) {
  try {
    const mentor = await resolveMentorForUser(req.user);
    const existing = await findSectionWithCourse(Number(req.params.id));
    if (!existing || (existing.mentor_id !== mentor.id && req.user.role !== 'admin')) {
      return next(new AppError(404, 'SECTION_NOT_FOUND', 'Bab tidak ditemukan'));
    }
    await deleteSection(existing.id);
    invalidateLandingCache();
    return res.json({ message: 'Bab dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function mentorCreateLesson(req, res, next) {
  try {
    const mentor = await resolveMentorForUser(req.user);
    const section = await findSectionWithCourse(Number(req.body.sectionId));
    if (!section || (section.mentor_id !== mentor.id && req.user.role !== 'admin')) {
      return next(new AppError(404, 'SECTION_NOT_FOUND', 'Bab tidak ditemukan'));
    }
    const lesson = await createLesson({
      sectionId: section.id,
      title: req.body.title,
      summary: req.body.summary,
      videoUrl: req.body.videoUrl,
      durationSec: req.body.durationSec,
      sortOrder: req.body.sortOrder,
      isPreview: req.body.isPreview
    });
    invalidateLandingCache();
    return res.status(201).json({ lesson });
  } catch (err) {
    return next(err);
  }
}

export async function mentorUpdateLesson(req, res, next) {
  try {
    const mentor = await resolveMentorForUser(req.user);
    const existing = await findLessonWithCourse(Number(req.params.id));
    if (!existing || (existing.mentor_id !== mentor.id && req.user.role !== 'admin')) {
      return next(new AppError(404, 'LESSON_NOT_FOUND', 'Pelajaran tidak ditemukan'));
    }
    const lesson = await updateLesson(existing.id, req.body);
    invalidateLandingCache();
    return res.json({ lesson });
  } catch (err) {
    return next(err);
  }
}

export async function mentorDeleteLesson(req, res, next) {
  try {
    const mentor = await resolveMentorForUser(req.user);
    const existing = await findLessonWithCourse(Number(req.params.id));
    if (!existing || (existing.mentor_id !== mentor.id && req.user.role !== 'admin')) {
      return next(new AppError(404, 'LESSON_NOT_FOUND', 'Pelajaran tidak ditemukan'));
    }
    await deleteLesson(existing.id);
    invalidateLandingCache();
    return res.json({ message: 'Pelajaran dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function mentorCreateLiveSession(req, res, next) {
  try {
    const mentor = await resolveMentorForUser(req.user);
    const course = await findCourseById(Number(req.body.courseId));
    if (!course || (course.mentor_id !== mentor.id && req.user.role !== 'admin')) {
      return next(new AppError(404, 'COURSE_NOT_FOUND', 'Kursus tidak ditemukan'));
    }
    const session = await createLiveSession({
      courseId: course.id,
      mentorId: mentor.id,
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

export async function mentorDeleteLiveSession(req, res, next) {
  try {
    const mentor = await resolveMentorForUser(req.user);
    const session = await findLiveSessionById(Number(req.params.id));
    if (!session || (session.mentor_id !== mentor.id && req.user.role !== 'admin')) {
      return next(new AppError(404, 'SESSION_NOT_FOUND', 'Sesi live tidak ditemukan'));
    }
    await deleteLiveSession(session.id);
    return res.json({ message: 'Sesi live dihapus' });
  } catch (err) {
    return next(err);
  }
}
