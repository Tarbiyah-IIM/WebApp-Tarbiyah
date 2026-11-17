import { Router } from 'express';
import {
  getCategories,
  getCourseDetail,
  getCourses,
  getLanding,
  getMentors,
  subscribeNewsletter,
  verifyCertificate
} from '../controllers/public.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';
import { coursesQuerySchema, subscribeSchema } from '../validators/schemas.js';

const router = Router();

router.get('/landing', getLanding);
router.get('/categories', getCategories);
router.get('/mentors', getMentors);
router.get('/courses', validateQuery(coursesQuerySchema), getCourses);
router.get('/courses/:slug', optionalAuth, getCourseDetail);
router.post('/subscribers', validateBody(subscribeSchema), subscribeNewsletter);
router.get('/certificates/verify/:code', verifyCertificate);

export default router;
