import { Router } from 'express';
import {
  getMentorCourseCurriculum,
  getMentorOverview,
  mentorCreateCourse,
  mentorCreateLesson,
  mentorCreateLiveSession,
  mentorCreateSection,
  mentorDeleteLesson,
  mentorDeleteLiveSession,
  mentorDeleteSection,
  mentorSubmitCourseForReview,
  mentorUpdateCourse,
  mentorUpdateLesson,
  mentorUpdateSection
} from '../controllers/mentor.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  courseBodySchema,
  lessonBodySchema,
  liveSessionBodySchema,
  sectionBodySchema
} from '../validators/schemas.js';

const router = Router();

router.use(authenticate, requireRole('mentor', 'admin'));

router.get('/overview', getMentorOverview);
router.get('/courses/:id/curriculum', getMentorCourseCurriculum);
router.post('/courses', validateBody(courseBodySchema), mentorCreateCourse);
router.patch('/courses/:id', validateBody(courseBodySchema), mentorUpdateCourse);
router.post('/courses/:id/submit', mentorSubmitCourseForReview);

router.post('/sections', validateBody(sectionBodySchema), mentorCreateSection);
router.patch('/sections/:id', validateBody(sectionBodySchema), mentorUpdateSection);
router.delete('/sections/:id', mentorDeleteSection);

router.post('/lessons', validateBody(lessonBodySchema), mentorCreateLesson);
router.patch('/lessons/:id', validateBody(lessonBodySchema), mentorUpdateLesson);
router.delete('/lessons/:id', mentorDeleteLesson);

router.post('/live-sessions', validateBody(liveSessionBodySchema), mentorCreateLiveSession);
router.delete('/live-sessions/:id', mentorDeleteLiveSession);

export default router;
