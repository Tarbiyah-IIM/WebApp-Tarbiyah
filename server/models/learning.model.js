import crypto from 'node:crypto';
import { pool, withTransaction } from '../config/db.js';
import { getCourseCurriculum } from './course.model.js';

export async function hasActiveSubscription(userId) {
  const [rows] = await pool.execute(
    "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active' AND ends_at > NOW() LIMIT 1",
    [userId]
  );
  return rows.length > 0;
}

export async function hasCourseAccess(userId, courseId) {
  const [enrolled] = await pool.execute(
    'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1',
    [userId, courseId]
  );
  if (enrolled.length > 0) {
    return { allowed: true, source: 'enrollment' };
  }
  const subscribed = await hasActiveSubscription(userId);
  if (subscribed) {
    return { allowed: true, source: 'subscription' };
  }
  return { allowed: false, source: null };
}

export async function getMyCourses(userId) {
  const [enrolledRows] = await pool.execute(
    `SELECT c.id, c.title, c.slug, c.subtitle, c.thumbnail_url, c.level, c.total_videos, c.duration_hours,
            c.rating_avg, cat.name AS category_name, m.name AS mentor_name,
            e.progress_pct, e.last_lesson_id, e.enrolled_at,
            cert.certificate_code
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     JOIN categories cat ON cat.id = c.category_id
     JOIN mentors m ON m.id = c.mentor_id
     LEFT JOIN certificates cert ON cert.user_id = e.user_id AND cert.course_id = e.course_id
     WHERE e.user_id = ?
     ORDER BY e.updated_at DESC, e.enrolled_at DESC`,
    [userId]
  );

  const enrolledIds = enrolledRows.map((r) => r.id);
  const subscribed = await hasActiveSubscription(userId);

  let recommendedQuery = `
    SELECT c.id, c.title, c.slug, c.subtitle, c.thumbnail_url, c.price, c.currency,
           c.badge, c.total_videos, c.rating_avg, c.rating_count,
           cat.name AS category_name, m.name AS mentor_name
    FROM courses c
    JOIN categories cat ON cat.id = c.category_id
    JOIN mentors m ON m.id = c.mentor_id
    WHERE c.is_published = 1 AND c.approval_status = 'approved'
  `;
  const params = [];
  if (enrolledIds.length > 0) {
    const placeholders = enrolledIds.map(() => '?').join(', ');
    recommendedQuery += ` AND c.id NOT IN (${placeholders})`;
    params.push(...enrolledIds);
  }
  recommendedQuery += ' ORDER BY c.rating_avg DESC, c.id ASC LIMIT 4';

  const [recommendedRows] = await pool.execute(recommendedQuery, params);

  return {
    hasPremium: subscribed,
    enrolled: enrolledRows,
    recommended: recommendedRows
  };
}

export async function getLearnCourseData(userId, courseId) {
  const [courseRows] = await pool.execute(
    `SELECT c.*, cat.name AS category_name, m.name AS mentor_name, m.title AS mentor_title, m.photo_url AS mentor_photo_url
     FROM courses c
     JOIN categories cat ON cat.id = c.category_id
     JOIN mentors m ON m.id = c.mentor_id
     WHERE c.id = ? LIMIT 1`,
    [courseId]
  );
  const course = courseRows[0];
  if (!course) return null;

  const curriculum = await getCourseCurriculum(courseId, true);

  const [progressRows] = await pool.execute(
    `SELECT lp.lesson_id
     FROM lesson_progress lp
     JOIN lessons l ON l.id = lp.lesson_id
     JOIN sections s ON s.id = l.section_id
     WHERE lp.user_id = ? AND s.course_id = ?`,
    [userId, courseId]
  );
  const completedLessonIds = progressRows.map((r) => r.lesson_id);

  const [enrollmentRows] = await pool.execute(
    'SELECT progress_pct, last_lesson_id FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1',
    [userId, courseId]
  );

  const [certRows] = await pool.execute(
    'SELECT certificate_code, issued_at FROM certificates WHERE user_id = ? AND course_id = ? LIMIT 1',
    [userId, courseId]
  );

  return {
    course,
    curriculum,
    completedLessonIds,
    progressPct: Number(enrollmentRows[0]?.progress_pct || 0),
    lastLessonId: enrollmentRows[0]?.last_lesson_id || null,
    certificate: certRows[0] || null
  };
}

export async function completeLessonAndSync(userId, lessonId) {
  return withTransaction(async (conn) => {
    const [lessonRows] = await conn.execute(
      `SELECT l.id, s.course_id
       FROM lessons l
       JOIN sections s ON s.id = l.section_id
       WHERE l.id = ? LIMIT 1`,
      [lessonId]
    );
    const lesson = lessonRows[0];
    if (!lesson) return null;

    await conn.execute(
      `INSERT INTO enrollments (user_id, course_id, progress_pct, last_lesson_id)
       VALUES (?, ?, 0, ?)
       ON DUPLICATE KEY UPDATE last_lesson_id = VALUES(last_lesson_id)`,
      [userId, lesson.course_id, lessonId]
    );

    await conn.execute(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed_at)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE completed_at = NOW()`,
      [userId, lessonId]
    );

    const [totalRows] = await conn.execute(
      `SELECT COUNT(*) AS total
       FROM lessons l
       JOIN sections s ON s.id = l.section_id
       WHERE s.course_id = ?`,
      [lesson.course_id]
    );
    const totalLessons = Number(totalRows[0]?.total || 0);

    const [doneRows] = await conn.execute(
      `SELECT COUNT(*) AS done
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       JOIN sections s ON s.id = l.section_id
       WHERE lp.user_id = ? AND s.course_id = ?`,
      [userId, lesson.course_id]
    );
    const doneLessons = Number(doneRows[0]?.done || 0);
    const progressPct = totalLessons > 0 ? Number(((doneLessons / totalLessons) * 100).toFixed(2)) : 0;

    await conn.execute(
      'UPDATE enrollments SET progress_pct = ?, last_lesson_id = ? WHERE user_id = ? AND course_id = ?',
      [progressPct, lessonId, userId, lesson.course_id]
    );

    let certificate = null;
    if (progressPct >= 100) {
      const [existingCert] = await conn.execute(
        'SELECT certificate_code, issued_at FROM certificates WHERE user_id = ? AND course_id = ? LIMIT 1',
        [userId, lesson.course_id]
      );
      if (existingCert.length > 0) {
        certificate = existingCert[0];
      } else {
        const code = `MKO-${lesson.course_id}-${userId}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        await conn.execute(
          'INSERT INTO certificates (user_id, course_id, certificate_code) VALUES (?, ?, ?)',
          [userId, lesson.course_id, code]
        );
        const [newCert] = await conn.execute(
          'SELECT certificate_code, issued_at FROM certificates WHERE certificate_code = ? LIMIT 1',
          [code]
        );
        certificate = newCert[0] || null;
      }
    }

    return {
      courseId: lesson.course_id,
      lessonId,
      completedCount: doneLessons,
      totalLessons,
      progressPct,
      certificate
    };
  });
}

export async function getCourseReviews(courseId) {
  const [rows] = await pool.execute(
    `SELECT r.id, r.user_id, r.course_id, r.rating, r.comment, r.created_at,
            u.name AS user_name, u.avatar_url AS user_avatar_url
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.course_id = ?
     ORDER BY r.created_at DESC`,
    [courseId]
  );
  return rows;
}

export async function createReviewAndSyncCourse({ userId, courseId, rating, comment }) {
  return withTransaction(async (conn) => {
    const [existing] = await conn.execute(
      'SELECT id FROM reviews WHERE user_id = ? AND course_id = ? LIMIT 1',
      [userId, courseId]
    );
    if (existing.length > 0) {
      return { duplicate: true };
    }

    const [insertRes] = await conn.execute(
      'INSERT INTO reviews (user_id, course_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, courseId, rating, comment]
    );

    const [aggRows] = await conn.execute(
      'SELECT COUNT(*) AS cnt, COALESCE(AVG(rating), 0) AS avg_rating FROM reviews WHERE course_id = ?',
      [courseId]
    );
    const ratingCount = Number(aggRows[0]?.cnt || 0);
    const ratingAvg = Number(Number(aggRows[0]?.avg_rating || 0).toFixed(2));

    await conn.execute(
      'UPDATE courses SET rating_avg = ?, rating_count = ? WHERE id = ?',
      [ratingAvg, ratingCount, courseId]
    );

    const [rows] = await conn.execute(
      `SELECT r.id, r.user_id, r.course_id, r.rating, r.comment, r.created_at,
              u.name AS user_name, u.avatar_url AS user_avatar_url
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.id = ? LIMIT 1`,
      [insertRes.insertId]
    );

    return {
      duplicate: false,
      review: rows[0],
      ratingAvg,
      ratingCount
    };
  });
}

export async function getMyCertificates(userId) {
  const [rows] = await pool.execute(
    `SELECT cert.id, cert.certificate_code, cert.issued_at,
            c.id AS course_id, c.title AS course_title, c.slug AS course_slug, c.duration_hours,
            m.name AS mentor_name, u.name AS student_name
     FROM certificates cert
     JOIN courses c ON c.id = cert.course_id
     JOIN mentors m ON m.id = c.mentor_id
     JOIN users u ON u.id = cert.user_id
     WHERE cert.user_id = ?
     ORDER BY cert.issued_at DESC`,
    [userId]
  );
  return rows;
}

export async function verifyCertificateByCode(code) {
  const [rows] = await pool.execute(
    `SELECT cert.certificate_code, cert.issued_at,
            c.title AS course_title, c.slug AS course_slug, c.duration_hours,
            m.name AS mentor_name, m.title AS mentor_title,
            u.name AS student_name
     FROM certificates cert
     JOIN courses c ON c.id = cert.course_id
     JOIN mentors m ON m.id = c.mentor_id
     JOIN users u ON u.id = cert.user_id
     WHERE cert.certificate_code = ?
     LIMIT 1`,
    [code]
  );
  return rows[0] || null;
}
