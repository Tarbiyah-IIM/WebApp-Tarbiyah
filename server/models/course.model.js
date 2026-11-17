import { pool } from '../config/db.js';

export async function listCategories() {
  const [rows] = await pool.execute(
    'SELECT id, name, slug, description, sort_order FROM categories ORDER BY sort_order ASC, id ASC'
  );
  return rows;
}

export async function createCategory({ name, slug, description = '', sortOrder = 0 }) {
  const [result] = await pool.execute(
    'INSERT INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)',
    [name, slug, description, sortOrder]
  );
  const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function updateCategory(id, { name, slug, description = '', sortOrder = 0 }) {
  await pool.execute(
    'UPDATE categories SET name = ?, slug = ?, description = ?, sort_order = ? WHERE id = ?',
    [name, slug, description, sortOrder, id]
  );
  const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function deleteCategory(id) {
  const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function listMentors({ includeInactive = false } = {}) {
  const sql = includeInactive
    ? 'SELECT * FROM mentors ORDER BY sort_order ASC, id ASC'
    : 'SELECT * FROM mentors WHERE is_active = 1 ORDER BY sort_order ASC, id ASC';
  const [rows] = await pool.execute(sql);
  return rows;
}

export async function findMentorByUserId(userId) {
  const [rows] = await pool.execute('SELECT * FROM mentors WHERE user_id = ? LIMIT 1', [userId]);
  return rows[0] || null;
}

export async function findMentorById(id) {
  const [rows] = await pool.execute('SELECT * FROM mentors WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function createMentor({ userId = null, name, title, bio = '', photoUrl = null, sortOrder = 0, isActive = true }) {
  const [result] = await pool.execute(
    'INSERT INTO mentors (user_id, name, title, bio, photo_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, name, title, bio, photoUrl, sortOrder, isActive ? 1 : 0]
  );
  return findMentorById(result.insertId);
}

export async function updateMentor(id, { userId, name, title, bio = '', photoUrl = null, sortOrder = 0, isActive = true }) {
  const existing = await findMentorById(id);
  if (!existing) return null;
  const resolvedUserId = userId !== undefined ? userId : existing.user_id;
  await pool.execute(
    'UPDATE mentors SET user_id = ?, name = ?, title = ?, bio = ?, photo_url = ?, sort_order = ?, is_active = ? WHERE id = ?',
    [resolvedUserId, name, title, bio, photoUrl, sortOrder, isActive ? 1 : 0, id]
  );
  if (resolvedUserId) {
    await pool.execute(
      'UPDATE users SET name = ?, bio = COALESCE(?, bio), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
      [name, bio, photoUrl, resolvedUserId]
    );
  }
  return findMentorById(id);
}

export async function deleteMentor(id) {
  const [result] = await pool.execute('DELETE FROM mentors WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function listPublishedCourses({ category = '', q = '', level = '', page = 1, limit = 6 }) {
  const conditions = ['c.is_published = 1', "c.approval_status = 'approved'"];
  const params = [];

  if (category && category !== 'all') {
    conditions.push('cat.slug = ?');
    params.push(category);
  }
  if (level) {
    conditions.push('c.level = ?');
    params.push(level);
  }
  if (q) {
    conditions.push('(c.title LIKE ? OR c.subtitle LIKE ? OR c.description LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  const whereClause = conditions.join(' AND ');
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 6));
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM courses c
     JOIN categories cat ON cat.id = c.category_id
     WHERE ${whereClause}`,
    params
  );
  const total = Number(countRows[0]?.total || 0);

  const [rows] = await pool.query(
    `SELECT c.id, c.title, c.slug, c.subtitle, c.level, c.price, c.currency, c.thumbnail_url,
            c.badge, c.total_videos, c.duration_hours, c.rating_avg, c.rating_count,
            cat.id AS category_id, cat.name AS category_name, cat.slug AS category_slug,
            m.id AS mentor_id, m.name AS mentor_name, m.title AS mentor_title, m.photo_url AS mentor_photo_url
     FROM courses c
     JOIN categories cat ON cat.id = c.category_id
     JOIN mentors m ON m.id = c.mentor_id
     WHERE ${whereClause}
     ORDER BY c.id ASC
     LIMIT ? OFFSET ?`,
    [...params, safeLimit, offset]
  );

  return {
    items: rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
      hasMore: offset + rows.length < total
    }
  };
}

export async function listAllCoursesAdmin() {
  const [rows] = await pool.execute(
    `SELECT c.*, cat.name AS category_name, cat.slug AS category_slug,
            m.name AS mentor_name, m.title AS mentor_title,
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS student_count
     FROM courses c
     JOIN categories cat ON cat.id = c.category_id
     JOIN mentors m ON m.id = c.mentor_id
     ORDER BY c.created_at DESC, c.id DESC`
  );
  return rows;
}

export async function listMentorCourses(mentorId) {
  const [rows] = await pool.execute(
    `SELECT c.*, cat.name AS category_name, cat.slug AS category_slug,
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS student_count,
            (SELECT COALESCE(SUM(oi.price), 0)
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE oi.course_id = c.id AND o.status = 'paid') AS revenue_total
     FROM courses c
     JOIN categories cat ON cat.id = c.category_id
     WHERE c.mentor_id = ?
     ORDER BY c.created_at DESC, c.id DESC`,
    [mentorId]
  );
  return rows;
}

export async function findCourseBySlug(slug) {
  const [rows] = await pool.execute(
    `SELECT c.*, cat.name AS category_name, cat.slug AS category_slug,
            m.id AS mentor_id, m.user_id AS mentor_user_id, m.name AS mentor_name, m.title AS mentor_title, m.bio AS mentor_bio, m.photo_url AS mentor_photo_url
     FROM courses c
     JOIN categories cat ON cat.id = c.category_id
     JOIN mentors m ON m.id = c.mentor_id
     WHERE c.slug = ?
     LIMIT 1`,
    [slug]
  );
  return rows[0] || null;
}

export async function findCourseById(id) {
  const [rows] = await pool.execute(
    `SELECT c.*, cat.name AS category_name, cat.slug AS category_slug,
            m.name AS mentor_name, m.title AS mentor_title, m.photo_url AS mentor_photo_url
     FROM courses c
     JOIN categories cat ON cat.id = c.category_id
     JOIN mentors m ON m.id = c.mentor_id
     WHERE c.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function createCourse({
  categoryId,
  mentorId,
  title,
  slug,
  subtitle = '',
  description,
  level = 'beginner',
  price = 0,
  currency = 'USD',
  thumbnailUrl = null,
  badge = null,
  approvalStatus = 'approved',
  isPublished = true
}) {
  const [result] = await pool.execute(
    `INSERT INTO courses (category_id, mentor_id, title, slug, subtitle, description, level, price, currency, thumbnail_url, badge, approval_status, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [categoryId, mentorId, title, slug, subtitle, description, level, price, currency, thumbnailUrl, badge, approvalStatus, isPublished ? 1 : 0]
  );
  return findCourseById(result.insertId);
}

export async function updateCourse(
  id,
  {
    categoryId,
    mentorId,
    title,
    slug,
    subtitle = '',
    description,
    level = 'beginner',
    price = 0,
    currency = 'USD',
    thumbnailUrl = null,
    badge = null,
    approvalStatus = 'approved',
    isPublished = true
  }
) {
  await pool.execute(
    `UPDATE courses
     SET category_id = ?, mentor_id = ?, title = ?, slug = ?, subtitle = ?, description = ?,
         level = ?, price = ?, currency = ?, thumbnail_url = ?, badge = ?, approval_status = ?, is_published = ?
     WHERE id = ?`,
    [categoryId, mentorId, title, slug, subtitle, description, level, price, currency, thumbnailUrl, badge, approvalStatus, isPublished ? 1 : 0, id]
  );
  return findCourseById(id);
}

export async function deleteCourse(id) {
  const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getCourseCurriculum(courseId, includeVideoUrls = false) {
  const [sections] = await pool.execute(
    'SELECT id, course_id, title, sort_order FROM sections WHERE course_id = ? ORDER BY sort_order ASC, id ASC',
    [courseId]
  );

  if (sections.length === 0) {
    return [];
  }

  const [lessons] = await pool.execute(
    `SELECT l.id, l.section_id, l.title, l.summary, l.video_url, l.duration_sec, l.sort_order, l.is_preview
     FROM lessons l
     JOIN sections s ON s.id = l.section_id
     WHERE s.course_id = ?
     ORDER BY s.sort_order ASC, l.sort_order ASC, l.id ASC`,
    [courseId]
  );

  const lessonsBySection = new Map();
  for (const lesson of lessons) {
    const safeLesson = {
      id: lesson.id,
      section_id: lesson.section_id,
      title: lesson.title,
      summary: lesson.summary,
      duration_sec: lesson.duration_sec,
      sort_order: lesson.sort_order,
      is_preview: Boolean(lesson.is_preview),
      video_url: includeVideoUrls || lesson.is_preview ? lesson.video_url : null
    };
    if (!lessonsBySection.has(lesson.section_id)) {
      lessonsBySection.set(lesson.section_id, []);
    }
    lessonsBySection.get(lesson.section_id).push(safeLesson);
  }

  return sections.map((sec) => ({
    ...sec,
    lessons: lessonsBySection.get(sec.id) || []
  }));
}

export async function syncCourseVideoStats(courseId) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS video_count, COALESCE(SUM(l.duration_sec), 0) AS total_sec
     FROM lessons l
     JOIN sections s ON s.id = l.section_id
     WHERE s.course_id = ?`,
    [courseId]
  );
  const videoCount = Number(rows[0]?.video_count || 0);
  const hours = Number((Number(rows[0]?.total_sec || 0) / 3600).toFixed(1));
  await pool.execute(
    'UPDATE courses SET total_videos = ?, duration_hours = ? WHERE id = ?',
    [videoCount, hours, courseId]
  );
}

export async function findSectionWithCourse(sectionId) {
  const [rows] = await pool.execute(
    `SELECT s.*, c.mentor_id
     FROM sections s
     JOIN courses c ON c.id = s.course_id
     WHERE s.id = ?
     LIMIT 1`,
    [sectionId]
  );
  return rows[0] || null;
}

export async function createSection({ courseId, title, sortOrder = 0 }) {
  const [result] = await pool.execute(
    'INSERT INTO sections (course_id, title, sort_order) VALUES (?, ?, ?)',
    [courseId, title, sortOrder]
  );
  const [rows] = await pool.execute('SELECT * FROM sections WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function updateSection(id, { title, sortOrder = 0 }) {
  await pool.execute('UPDATE sections SET title = ?, sort_order = ? WHERE id = ?', [title, sortOrder, id]);
  const [rows] = await pool.execute('SELECT * FROM sections WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function deleteSection(id) {
  const section = await findSectionWithCourse(id);
  if (!section) return false;
  const [result] = await pool.execute('DELETE FROM sections WHERE id = ?', [id]);
  if (result.affectedRows > 0) {
    await syncCourseVideoStats(section.course_id);
    return true;
  }
  return false;
}

export async function findLessonWithCourse(lessonId) {
  const [rows] = await pool.execute(
    `SELECT l.*, s.course_id, c.mentor_id
     FROM lessons l
     JOIN sections s ON s.id = l.section_id
     JOIN courses c ON c.id = s.course_id
     WHERE l.id = ?
     LIMIT 1`,
    [lessonId]
  );
  return rows[0] || null;
}

export async function createLesson({ sectionId, title, summary = '', videoUrl, durationSec = 0, sortOrder = 0, isPreview = false }) {
  const section = await findSectionWithCourse(sectionId);
  if (!section) return null;
  const [result] = await pool.execute(
    'INSERT INTO lessons (section_id, title, summary, video_url, duration_sec, sort_order, is_preview) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [sectionId, title, summary, videoUrl, durationSec, sortOrder, isPreview ? 1 : 0]
  );
  await syncCourseVideoStats(section.course_id);
  const [rows] = await pool.execute('SELECT * FROM lessons WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function updateLesson(id, { title, summary = '', videoUrl, durationSec = 0, sortOrder = 0, isPreview = false }) {
  const existing = await findLessonWithCourse(id);
  if (!existing) return null;
  await pool.execute(
    'UPDATE lessons SET title = ?, summary = ?, video_url = ?, duration_sec = ?, sort_order = ?, is_preview = ? WHERE id = ?',
    [title, summary, videoUrl, durationSec, sortOrder, isPreview ? 1 : 0, id]
  );
  await syncCourseVideoStats(existing.course_id);
  const [rows] = await pool.execute('SELECT * FROM lessons WHERE id = ?', [id]);
  return rows[0];
}

export async function deleteLesson(id) {
  const existing = await findLessonWithCourse(id);
  if (!existing) return false;
  const [result] = await pool.execute('DELETE FROM lessons WHERE id = ?', [id]);
  if (result.affectedRows > 0) {
    await syncCourseVideoStats(existing.course_id);
    return true;
  }
  return false;
}
