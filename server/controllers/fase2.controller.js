import { AppError } from '../middlewares/error.middleware.js';
import { findCourseById, findMentorByUserId } from '../models/course.model.js';
import {
  createCourseCommunityPost,
  deleteCommunityPost,
  deleteLearningPath,
  findCommunityPostById,
  findLiveSessionById,
  generateUserLearningPath,
  listCourseCommunityPosts,
  listLiveSessions,
  listUserLearningPaths,
  registerUserForSession,
  reorderLearningPath,
  unregisterUserFromSession
} from '../models/fase2.model.js';
import { hasCourseAccess } from '../models/learning.model.js';

export async function getLiveSessions(req, res, next) {
  try {
    const courseId = req.query.courseId ? Number(req.query.courseId) : null;
    const items = await listLiveSessions({
      userId: req.user?.id || null,
      courseId
    });
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}

export async function registerLiveSession(req, res, next) {
  try {
    const sessionId = Number(req.params.id);
    const session = await findLiveSessionById(sessionId);
    if (!session) {
      return next(new AppError(404, 'SESSION_NOT_FOUND', 'Sesi live tidak ditemukan'));
    }
    await registerUserForSession(sessionId, req.user.id);
    return res.status(201).json({ message: 'Pendaftaran sesi live berhasil', session });
  } catch (err) {
    return next(err);
  }
}

export async function unregisterLiveSession(req, res, next) {
  try {
    const sessionId = Number(req.params.id);
    await unregisterUserFromSession(sessionId, req.user.id);
    return res.json({ message: 'Pendaftaran sesi live dibatalkan' });
  } catch (err) {
    return next(err);
  }
}

export async function getCommunityPosts(req, res, next) {
  try {
    const courseId = Number(req.params.courseId);
    const items = await listCourseCommunityPosts(courseId);
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}

export async function createCommunityPost(req, res, next) {
  try {
    const courseId = Number(req.params.courseId);
    if (req.user.role !== 'admin') {
      const access = await hasCourseAccess(req.user.id, courseId);
      let isCourseMentor = false;
      if (req.user.role === 'mentor') {
        const [mentor, course] = await Promise.all([findMentorByUserId(req.user.id), findCourseById(courseId)]);
        isCourseMentor = Boolean(mentor && course && course.mentor_id === mentor.id);
      }
      if (!access.allowed && !isCourseMentor) {
        return next(new AppError(403, 'NOT_ENROLLED', 'Daftar kursus atau aktifkan Premium untuk berdiskusi'));
      }
    }

    const post = await createCourseCommunityPost({
      courseId,
      userId: req.user.id,
      parentId: req.body.parentId ? Number(req.body.parentId) : null,
      body: req.body.body.trim()
    });
    return res.status(201).json({ post });
  } catch (err) {
    return next(err);
  }
}

export async function removeCommunityPost(req, res, next) {
  try {
    const postId = Number(req.params.postId);
    const post = await findCommunityPostById(postId);
    if (!post) {
      return next(new AppError(404, 'POST_NOT_FOUND', 'Postingan tidak ditemukan'));
    }

    let isCourseMentor = false;
    if (req.user.role === 'mentor') {
      const mentor = await findMentorByUserId(req.user.id);
      isCourseMentor = mentor && mentor.id === post.mentor_id;
    }

    if (post.user_id !== req.user.id && req.user.role !== 'admin' && !isCourseMentor) {
      return next(new AppError(403, 'FORBIDDEN', 'Anda tidak berhak menghapus postingan ini'));
    }

    await deleteCommunityPost(postId);
    return res.json({ message: 'Postingan dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function getMyLearningPaths(req, res, next) {
  try {
    const items = await listUserLearningPaths(req.user.id);
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}

export async function generateLearningPath(req, res, next) {
  try {
    const { goalTitle, categoryId, targetLevel } = req.body;
    await generateUserLearningPath({
      userId: req.user.id,
      goalTitle: goalTitle.trim(),
      categoryId: categoryId ? Number(categoryId) : null,
      targetLevel: targetLevel || 'beginner'
    });
    const items = await listUserLearningPaths(req.user.id);
    return res.status(201).json({ items });
  } catch (err) {
    return next(err);
  }
}

export async function updateLearningPathOrder(req, res, next) {
  try {
    const pathId = Number(req.params.id);
    const ok = await reorderLearningPath({
      pathId,
      userId: req.user.id,
      orderedItemIds: req.body.orderedItemIds
    });
    if (!ok) {
      return next(new AppError(404, 'PATH_NOT_FOUND', 'Learning path tidak ditemukan'));
    }
    const items = await listUserLearningPaths(req.user.id);
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}

export async function removeLearningPath(req, res, next) {
  try {
    const ok = await deleteLearningPath({
      pathId: Number(req.params.id),
      userId: req.user.id
    });
    if (!ok) {
      return next(new AppError(404, 'PATH_NOT_FOUND', 'Learning path tidak ditemukan'));
    }
    return res.json({ message: 'Learning path dihapus' });
  } catch (err) {
    return next(err);
  }
}
