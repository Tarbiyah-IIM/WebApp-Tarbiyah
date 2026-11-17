import { pool, withTransaction } from '../config/db.js';

export async function listLiveSessions({ userId = null, mentorId = null, courseId = null } = {}) {
  const conditions = [];
  const params = [];

  if (mentorId) {
    conditions.push('ls.mentor_id = ?');
    params.push(mentorId);
  }
  if (courseId) {
    conditions.push('ls.course_id = ?');
    params.push(courseId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.execute(
    `SELECT ls.*, c.title AS course_title, c.slug AS course_slug,
            m.name AS mentor_name, m.title AS mentor_title,
            (SELECT COUNT(*) FROM session_registrations sr WHERE sr.session_id = ls.id) AS registered_count
     FROM live_sessions ls
     JOIN courses c ON c.id = ls.course_id
     JOIN mentors m ON m.id = ls.mentor_id
     ${whereClause}
     ORDER BY ls.starts_at ASC`,
    params
  );

  if (!userId || rows.length === 0) {
    return rows.map((r) => ({ ...r, is_registered: false }));
  }

  const [regs] = await pool.execute(
    'SELECT session_id FROM session_registrations WHERE user_id = ?',
    [userId]
  );
  const regSet = new Set(regs.map((r) => r.session_id));

  return rows.map((r) => ({
    ...r,
    is_registered: regSet.has(r.id),
    meeting_url: regSet.has(r.id) || mentorId ? r.meeting_url : null
  }));
}

export async function findLiveSessionById(id) {
  const [rows] = await pool.execute('SELECT * FROM live_sessions WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function registerUserForSession(sessionId, userId) {
  await pool.execute(
    `INSERT INTO session_registrations (session_id, user_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE updated_at = NOW()`,
    [sessionId, userId]
  );
  return findLiveSessionById(sessionId);
}

export async function unregisterUserFromSession(sessionId, userId) {
  const [result] = await pool.execute(
    'DELETE FROM session_registrations WHERE session_id = ? AND user_id = ?',
    [sessionId, userId]
  );
  return result.affectedRows > 0;
}

export async function createLiveSession({ courseId, mentorId, title, description = '', startsAt, durationMin = 60, platform = 'zoom', meetingUrl }) {
  const [result] = await pool.execute(
    'INSERT INTO live_sessions (course_id, mentor_id, title, description, starts_at, duration_min, platform, meeting_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [courseId, mentorId, title, description, startsAt, durationMin, platform, meetingUrl]
  );
  return findLiveSessionById(result.insertId);
}

export async function deleteLiveSession(id) {
  const [result] = await pool.execute('DELETE FROM live_sessions WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function listCourseCommunityPosts(courseId) {
  const [rows] = await pool.execute(
    `SELECT cp.id, cp.course_id, cp.user_id, cp.parent_id, cp.body, cp.created_at,
            u.name AS user_name, u.role AS user_role, u.avatar_url AS user_avatar_url
     FROM community_posts cp
     JOIN users u ON u.id = cp.user_id
     WHERE cp.course_id = ?
     ORDER BY cp.created_at ASC`,
    [courseId]
  );

  const byId = new Map();
  const roots = [];

  for (const row of rows) {
    byId.set(row.id, { ...row, replies: [] });
  }
  for (const row of rows) {
    const node = byId.get(row.id);
    if (row.parent_id && byId.has(row.parent_id)) {
      byId.get(row.parent_id).replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots.reverse();
}

export async function findCommunityPostById(id) {
  const [rows] = await pool.execute(
    `SELECT cp.*, c.mentor_id
     FROM community_posts cp
     JOIN courses c ON c.id = cp.course_id
     WHERE cp.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function createCourseCommunityPost({ courseId, userId, parentId = null, body }) {
  const [result] = await pool.execute(
    'INSERT INTO community_posts (course_id, user_id, parent_id, body) VALUES (?, ?, ?, ?)',
    [courseId, userId, parentId, body]
  );
  const [rows] = await pool.execute(
    `SELECT cp.id, cp.course_id, cp.user_id, cp.parent_id, cp.body, cp.created_at,
            u.name AS user_name, u.role AS user_role, u.avatar_url AS user_avatar_url
     FROM community_posts cp
     JOIN users u ON u.id = cp.user_id
     WHERE cp.id = ? LIMIT 1`,
    [result.insertId]
  );
  return rows[0];
}

export async function deleteCommunityPost(id) {
  const [result] = await pool.execute('DELETE FROM community_posts WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function listUserLearningPaths(userId) {
  const [paths] = await pool.execute(
    `SELECT lp.*, cat.name AS category_name
     FROM learning_paths lp
     LEFT JOIN categories cat ON cat.id = lp.interest_category_id
     WHERE lp.user_id = ?
     ORDER BY lp.created_at DESC`,
    [userId]
  );

  if (paths.length === 0) return [];

  const pathIds = paths.map((p) => p.id);
  const placeholders = pathIds.map(() => '?').join(', ');
  const [items] = await pool.execute(
    `SELECT lpi.id, lpi.path_id, lpi.course_id, lpi.sort_order,
            c.title, c.slug, c.level, c.price, c.duration_hours, c.thumbnail_url,
            COALESCE(e.progress_pct, 0) AS progress_pct
     FROM learning_path_items lpi
     JOIN courses c ON c.id = lpi.course_id
     LEFT JOIN enrollments e ON e.course_id = c.id AND e.user_id = ?
     WHERE lpi.path_id IN (${placeholders})
     ORDER BY lpi.sort_order ASC, lpi.id ASC`,
    [userId, ...pathIds]
  );

  const itemsByPath = new Map();
  for (const item of items) {
    if (!itemsByPath.has(item.path_id)) itemsByPath.set(item.path_id, []);
    itemsByPath.get(item.path_id).push({
      ...item,
      is_completed: Number(item.progress_pct) >= 100
    });
  }

  return paths.map((p) => ({ ...p, items: itemsByPath.get(p.id) || [] }));
}

export async function generateUserLearningPath({ userId, goalTitle, categoryId = null, targetLevel = 'beginner' }) {
  return withTransaction(async (conn) => {
    const [resPath] = await conn.execute(
      'INSERT INTO learning_paths (user_id, goal_title, interest_category_id, target_level) VALUES (?, ?, ?, ?)',
      [userId, goalTitle, categoryId, targetLevel]
    );

    const conditions = ['is_published = 1', "approval_status = 'approved'"];
    const params = [];
    if (categoryId) {
      conditions.push('category_id = ?');
      params.push(categoryId);
    }

    const [courses] = await conn.execute(
      `SELECT id, level
       FROM courses
       WHERE ${conditions.join(' AND ')}
       ORDER BY FIELD(level, 'beginner', 'intermediate', 'advanced'), rating_avg DESC
       LIMIT 6`,
      params
    );

    let ordered = courses;
    if (ordered.length < 3) {
      const [fallback] = await conn.execute(
        `SELECT id, level
         FROM courses
         WHERE is_published = 1 AND approval_status = 'approved'
         ORDER BY FIELD(level, 'beginner', 'intermediate', 'advanced'), rating_avg DESC
         LIMIT 4`
      );
      const seen = new Set(ordered.map((c) => c.id));
      for (const fc of fallback) {
        if (!seen.has(fc.id)) ordered.push(fc);
      }
    }

    if (targetLevel === 'advanced') {
      ordered = [...ordered].sort((a, b) => {
        const rank = { advanced: 1, intermediate: 2, beginner: 3 };
        return (rank[a.level] || 9) - (rank[b.level] || 9);
      });
    }

    for (let idx = 0; idx < ordered.length; idx++) {
      await conn.execute(
        'INSERT INTO learning_path_items (path_id, course_id, sort_order) VALUES (?, ?, ?)',
        [resPath.insertId, ordered[idx].id, idx + 1]
      );
    }

    return resPath.insertId;
  });
}

export async function reorderLearningPath({ pathId, userId, orderedItemIds }) {
  return withTransaction(async (conn) => {
    const [paths] = await conn.execute(
      'SELECT id FROM learning_paths WHERE id = ? AND user_id = ? LIMIT 1',
      [pathId, userId]
    );
    if (paths.length === 0) return false;

    for (let idx = 0; idx < orderedItemIds.length; idx++) {
      await conn.execute(
        'UPDATE learning_path_items SET sort_order = ? WHERE id = ? AND path_id = ?',
        [idx + 1, orderedItemIds[idx], pathId]
      );
    }
    return true;
  });
}

export async function deleteLearningPath({ pathId, userId }) {
  const [result] = await pool.execute(
    'DELETE FROM learning_paths WHERE id = ? AND user_id = ?',
    [pathId, userId]
  );
  return result.affectedRows > 0;
}
