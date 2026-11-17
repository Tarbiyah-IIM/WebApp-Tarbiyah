import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { invalidateLandingCache } from '../config/cache.js';
import { env } from '../config/env.js';
import { AppError } from '../middlewares/error.middleware.js';
import { findCourseById, findLessonWithCourse, findMentorByUserId } from '../models/course.model.js';
import {
  completeLessonAndSync,
  createReviewAndSyncCourse,
  getLearnCourseData,
  getMyCertificates,
  getMyCourses,
  hasCourseAccess
} from '../models/learning.model.js';
import {
  createOrder,
  findOrderById,
  getActiveSubscription,
  listUserOrders,
  processPaymentWebhookTransactional,
  updateSubscriptionAutoRenew
} from '../models/order.model.js';
import { deleteUserById, updateUserPassword, updateUserProfile } from '../models/user.model.js';

export async function getMe(req, res) {
  const subscription = await getActiveSubscription(req.user.id);
  return res.json({ user: req.user, subscription });
}

export async function updateMe(req, res, next) {
  try {
    const { name, avatarUrl, bio, newPassword } = req.body;
    const updated = await updateUserProfile(req.user.id, {
      name: name ? name.trim() : req.user.name,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : req.user.avatar_url,
      bio: bio !== undefined ? bio : req.user.bio
    });

    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 10);
      await updateUserPassword(req.user.id, hash);
    }

    if (req.user.role === 'mentor') {
      invalidateLandingCache();
    }

    return res.json({ user: updated });
  } catch (err) {
    return next(err);
  }
}

export async function deleteMe(req, res, next) {
  try {
    await deleteUserById(req.user.id);
    res.clearCookie('meekoo_refresh', { path: '/api/v1/auth' });
    return res.json({ message: 'Akun dan data terkait berhasil dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function myCourses(req, res, next) {
  try {
    const data = await getMyCourses(req.user.id);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export async function myOrders(req, res, next) {
  try {
    const orders = await listUserOrders(req.user.id);
    return res.json({ items: orders });
  } catch (err) {
    return next(err);
  }
}

export async function myCertificates(req, res, next) {
  try {
    const certs = await getMyCertificates(req.user.id);
    return res.json({ items: certs });
  } catch (err) {
    return next(err);
  }
}

export async function mySubscription(req, res, next) {
  try {
    const subscription = await getActiveSubscription(req.user.id);
    return res.json({ subscription });
  } catch (err) {
    return next(err);
  }
}

export async function toggleSubscriptionAutoRenew(req, res, next) {
  try {
    const updated = await updateSubscriptionAutoRenew(req.user.id, Boolean(req.body.autoRenew));
    if (!updated) {
      return next(new AppError(404, 'SUBSCRIPTION_NOT_FOUND', 'Langganan aktif tidak ditemukan'));
    }
    return res.json({ subscription: updated });
  } catch (err) {
    return next(err);
  }
}

export async function placeOrder(req, res, next) {
  try {
    const { orderType, courseIds, paymentMethod } = req.body;
    const result = await createOrder({
      userId: req.user.id,
      orderType: orderType || 'course',
      courseIds: courseIds || [],
      paymentMethod: paymentMethod || 'sandbox_card'
    });

    if (result?.emptyCourses) {
      return next(new AppError(400, 'EMPTY_COURSES', 'Pilih minimal satu kursus untuk checkout'));
    }
    if (result?.invalidCourse) {
      return next(new AppError(404, 'COURSE_NOT_FOUND', 'Salah satu kursus tidak tersedia'));
    }
    if (result?.alreadyEnrolled) {
      return next(new AppError(409, 'ALREADY_ENROLLED', 'Anda sudah terdaftar di salah satu kursus yang dipilih'));
    }

    return res.status(201).json({
      order: result,
      paymentUrl: `/checkout/${result.id}`
    });
  } catch (err) {
    return next(err);
  }
}

export async function getOrderDetail(req, res, next) {
  try {
    const order = await findOrderById(Number(req.params.id));
    if (!order) {
      return next(new AppError(404, 'ORDER_NOT_FOUND', 'Pesanan tidak ditemukan'));
    }
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError(403, 'FORBIDDEN', 'Anda tidak berhak melihat pesanan ini'));
    }
    return res.json({ order });
  } catch (err) {
    return next(err);
  }
}

export async function simulateSandboxPayment(req, res, next) {
  try {
    const orderId = Number(req.params.id);
    const existing = await findOrderById(orderId);
    if (!existing) {
      return next(new AppError(404, 'ORDER_NOT_FOUND', 'Pesanan tidak ditemukan'));
    }
    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError(403, 'FORBIDDEN', 'Anda tidak berhak memproses pesanan ini'));
    }

    const status = req.body.outcome === 'failed' ? 'failed' : 'paid';
    const order = await processPaymentWebhookTransactional({
      orderId,
      status,
      gatewayRef: `SBX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
    });

    return res.json({ order });
  } catch (err) {
    return next(err);
  }
}

export async function paymentWebhook(req, res, next) {
  try {
    const signature = req.headers['x-meekoo-signature'];
    if (!signature || typeof signature !== 'string') {
      return next(new AppError(401, 'MISSING_SIGNATURE', 'Signature webhook tidak ditemukan'));
    }

    const expected = crypto
      .createHmac('sha256', env.paymentWebhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expected, 'utf8');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return next(new AppError(401, 'INVALID_SIGNATURE', 'Signature webhook tidak valid'));
    }

    const { orderId, status, gatewayRef } = req.body;
    const updated = await processPaymentWebhookTransactional({
      orderId: Number(orderId),
      status,
      gatewayRef
    });

    if (!updated) {
      return next(new AppError(404, 'ORDER_NOT_FOUND', 'Pesanan tidak ditemukan'));
    }

    return res.json({ received: true, order: updated });
  } catch (err) {
    return next(err);
  }
}

async function checkLearnOrMentorAccess(user, courseId) {
  if (user.role === 'admin') {
    return { allowed: true, source: 'admin' };
  }
  const access = await hasCourseAccess(user.id, courseId);
  if (access.allowed) {
    return access;
  }
  if (user.role === 'mentor') {
    const [mentor, course] = await Promise.all([findMentorByUserId(user.id), findCourseById(courseId)]);
    if (mentor && course && course.mentor_id === mentor.id) {
      return { allowed: true, source: 'mentor_owner' };
    }
  }
  return { allowed: false, source: null };
}

export async function learnCourse(req, res, next) {
  try {
    const courseId = Number(req.params.id);
    const access = await checkLearnOrMentorAccess(req.user, courseId);
    if (!access.allowed) {
      return next(new AppError(403, 'NOT_ENROLLED', 'Anda belum membeli kursus ini atau belum memiliki paket Premium aktif'));
    }

    const data = await getLearnCourseData(req.user.id, courseId);
    if (!data) {
      return next(new AppError(404, 'COURSE_NOT_FOUND', 'Kursus tidak ditemukan'));
    }

    return res.json({ ...data, accessSource: access.source });
  } catch (err) {
    return next(err);
  }
}

export async function completeLesson(req, res, next) {
  try {
    const lessonId = Number(req.params.id);
    const lesson = await findLessonWithCourse(lessonId);
    if (!lesson) {
      return next(new AppError(404, 'LESSON_NOT_FOUND', 'Pelajaran tidak ditemukan'));
    }

    const access = await checkLearnOrMentorAccess(req.user, lesson.course_id);
    if (!access.allowed) {
      return next(new AppError(403, 'NOT_ENROLLED', 'Anda belum terdaftar di kursus ini'));
    }

    const progress = await completeLessonAndSync(req.user.id, lessonId);
    return res.json(progress);
  } catch (err) {
    return next(err);
  }
}

export async function submitCourseReview(req, res, next) {
  try {
    const courseId = Number(req.params.id);
    const access = await hasCourseAccess(req.user.id, courseId);
    if (!access.allowed) {
      return next(new AppError(403, 'NOT_ENROLLED', 'Hanya pelajar terdaftar yang dapat memberi ulasan'));
    }

    const result = await createReviewAndSyncCourse({
      userId: req.user.id,
      courseId,
      rating: req.body.rating,
      comment: req.body.comment.trim()
    });

    if (result.duplicate) {
      return next(new AppError(409, 'REVIEW_EXISTS', 'Anda sudah memberikan ulasan untuk kursus ini'));
    }

    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}
