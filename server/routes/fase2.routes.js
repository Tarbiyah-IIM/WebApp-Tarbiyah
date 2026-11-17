import { Router } from 'express';
import {
  createCommunityPost,
  generateLearningPath,
  getCommunityPosts,
  getLiveSessions,
  getMyLearningPaths,
  registerLiveSession,
  removeCommunityPost,
  removeLearningPath,
  unregisterLiveSession,
  updateLearningPathOrder
} from '../controllers/fase2.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  communityPostSchema,
  learningPathGenerateSchema,
  learningPathReorderSchema
} from '../validators/schemas.js';

const router = Router();

router.get('/live-sessions', optionalAuth, getLiveSessions);
router.post('/live-sessions/:id/register', authenticate, registerLiveSession);
router.delete('/live-sessions/:id/register', authenticate, unregisterLiveSession);

router.get('/courses/:courseId/community', getCommunityPosts);
router.post('/courses/:courseId/community', authenticate, validateBody(communityPostSchema), createCommunityPost);
router.delete('/community/:postId', authenticate, removeCommunityPost);

router.get('/learning-paths', authenticate, getMyLearningPaths);
router.post('/learning-paths/generate', authenticate, validateBody(learningPathGenerateSchema), generateLearningPath);
router.patch('/learning-paths/:id', authenticate, validateBody(learningPathReorderSchema), updateLearningPathOrder);
router.delete('/learning-paths/:id', authenticate, removeLearningPath);

export default router;
