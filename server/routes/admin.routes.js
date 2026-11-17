import { Router } from 'express';
import {
  adminCreateCategory,
  adminCreateCourse,
  adminCreateFaq,
  adminCreateFeature,
  adminCreateLesson,
  adminCreateLiveSession,
  adminCreateMentor,
  adminCreatePartner,
  adminCreateSection,
  adminCreateStat,
  adminCreateTestimonial,
  adminDeleteCategory,
  adminDeleteCourse,
  adminDeleteFaq,
  adminDeleteFeature,
  adminDeleteLesson,
  adminDeleteLiveSession,
  adminDeleteMentor,
  adminDeletePartner,
  adminDeleteSection,
  adminDeleteStat,
  adminDeleteTestimonial,
  adminGetCourseCurriculum,
  adminGetSettings,
  adminListCategories,
  adminListCourses,
  adminListFaqs,
  adminListFeatures,
  adminListLiveSessions,
  adminListMentors,
  adminListOrders,
  adminListPartners,
  adminListStats,
  adminListTestimonials,
  adminListUsers,
  adminUpdateCategory,
  adminUpdateCourse,
  adminUpdateFaq,
  adminUpdateFeature,
  adminUpdateLesson,
  adminUpdateMentor,
  adminUpdateOrderStatus,
  adminUpdatePartner,
  adminUpdateSection,
  adminUpdateSettings,
  adminUpdateStat,
  adminUpdateTestimonial,
  adminUpdateUser,
  adminUploadImage,
  getAdminOverview
} from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  adminUserUpdateSchema,
  categoryBodySchema,
  courseBodySchema,
  faqBodySchema,
  featureBodySchema,
  lessonBodySchema,
  liveSessionBodySchema,
  mentorBodySchema,
  partnerBodySchema,
  sectionBodySchema,
  statBodySchema,
  testimonialBodySchema
} from '../validators/schemas.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/overview', getAdminOverview);
router.get('/users', adminListUsers);
router.patch('/users/:id', validateBody(adminUserUpdateSchema), adminUpdateUser);

router.get('/orders', adminListOrders);
router.patch('/orders/:id', adminUpdateOrderStatus);

router.get('/courses', adminListCourses);
router.get('/courses/:id/curriculum', adminGetCourseCurriculum);
router.post('/courses', validateBody(courseBodySchema), adminCreateCourse);
router.patch('/courses/:id', validateBody(courseBodySchema), adminUpdateCourse);
router.delete('/courses/:id', adminDeleteCourse);

router.post('/sections', validateBody(sectionBodySchema), adminCreateSection);
router.patch('/sections/:id', validateBody(sectionBodySchema), adminUpdateSection);
router.delete('/sections/:id', adminDeleteSection);

router.post('/lessons', validateBody(lessonBodySchema), adminCreateLesson);
router.patch('/lessons/:id', validateBody(lessonBodySchema), adminUpdateLesson);
router.delete('/lessons/:id', adminDeleteLesson);

router.get('/categories', adminListCategories);
router.post('/categories', validateBody(categoryBodySchema), adminCreateCategory);
router.patch('/categories/:id', validateBody(categoryBodySchema), adminUpdateCategory);
router.delete('/categories/:id', adminDeleteCategory);

router.get('/mentors', adminListMentors);
router.post('/mentors', validateBody(mentorBodySchema), adminCreateMentor);
router.patch('/mentors/:id', validateBody(mentorBodySchema), adminUpdateMentor);
router.delete('/mentors/:id', adminDeleteMentor);

router.get('/testimonials', adminListTestimonials);
router.post('/testimonials', validateBody(testimonialBodySchema), adminCreateTestimonial);
router.patch('/testimonials/:id', validateBody(testimonialBodySchema), adminUpdateTestimonial);
router.delete('/testimonials/:id', adminDeleteTestimonial);

router.get('/faqs', adminListFaqs);
router.post('/faqs', validateBody(faqBodySchema), adminCreateFaq);
router.patch('/faqs/:id', validateBody(faqBodySchema), adminUpdateFaq);
router.delete('/faqs/:id', adminDeleteFaq);

router.get('/stats', adminListStats);
router.post('/stats', validateBody(statBodySchema), adminCreateStat);
router.patch('/stats/:id', validateBody(statBodySchema), adminUpdateStat);
router.delete('/stats/:id', adminDeleteStat);

router.get('/features', adminListFeatures);
router.post('/features', validateBody(featureBodySchema), adminCreateFeature);
router.patch('/features/:id', validateBody(featureBodySchema), adminUpdateFeature);
router.delete('/features/:id', adminDeleteFeature);

router.get('/partners', adminListPartners);
router.post('/partners', validateBody(partnerBodySchema), adminCreatePartner);
router.patch('/partners/:id', validateBody(partnerBodySchema), adminUpdatePartner);
router.delete('/partners/:id', adminDeletePartner);

router.get('/settings', adminGetSettings);
router.patch('/settings', adminUpdateSettings);

router.get('/live-sessions', adminListLiveSessions);
router.post('/live-sessions', validateBody(liveSessionBodySchema), adminCreateLiveSession);
router.delete('/live-sessions/:id', adminDeleteLiveSession);

router.post('/uploads', uploadImage.single('file'), adminUploadImage);

export default router;
