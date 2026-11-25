import { Router } from 'express';
import {
  adminCreateAgenda,
  adminCreateFaq,
  adminCreateFeature,
  adminCreateNewsCategory,
  adminCreatePartner,
  adminCreateStat,
  adminCreateTestimonial,
  adminDeleteAgenda,
  adminDeleteFaq,
  adminDeleteFeature,
  adminDeleteNewsCategory,
  adminDeletePartner,
  adminDeleteStat,
  adminDeleteTestimonial,
  adminGetSettings,
  adminListAgendas,
  adminListFaqs,
  adminListFeatures,
  adminListNewsCategories,
  adminListPartners,
  adminListStats,
  adminListTestimonials,
  adminListAuditLog,
  adminListUsers,
  adminUpdateAgenda,
  adminUpdateFaq,
  adminUpdateFeature,
  adminUpdatePartner,
  adminUpdateSettings,
  adminUpdateStat,
  adminUpdateTestimonial,
  adminUpdateUser,
  adminDeleteUploadedImage,
  adminUploadImage,
  getAdminOverview
} from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';
import { adminUploadLimiter, adminWriteLimiter, limitWrites } from '../middlewares/adminRateLimit.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  adminSettingsUpdateSchema,
  adminUserUpdateSchema,
  agendaBodySchema,
  faqBodySchema,
  featureBodySchema,
  newsCategoryBodySchema,
  partnerBodySchema,
  statBodySchema,
  testimonialBodySchema
} from '../validators/schemas.js';

const router = Router();

router.use(authenticate, requireRole('admin'));
router.use(limitWrites(adminWriteLimiter));

router.get('/overview', getAdminOverview);
router.get('/users', adminListUsers);
router.get('/audit-log', adminListAuditLog);
router.patch('/users/:id', validateBody(adminUserUpdateSchema), adminUpdateUser);

router.get('/testimonials', adminListTestimonials);
router.post('/testimonials', validateBody(testimonialBodySchema), adminCreateTestimonial);
router.patch('/testimonials/:id', validateBody(testimonialBodySchema), adminUpdateTestimonial);
router.delete('/testimonials/:id', adminDeleteTestimonial);

router.get('/news-categories', adminListNewsCategories);
router.post('/news-categories', validateBody(newsCategoryBodySchema), adminCreateNewsCategory);
router.delete('/news-categories/:id', adminDeleteNewsCategory);

router.get('/agendas', adminListAgendas);
router.post('/agendas', validateBody(agendaBodySchema), adminCreateAgenda);
router.patch('/agendas/:id', validateBody(agendaBodySchema), adminUpdateAgenda);
router.delete('/agendas/:id', adminDeleteAgenda);

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
router.patch('/settings', validateBody(adminSettingsUpdateSchema), adminUpdateSettings);

router.post('/uploads', limitWrites(adminUploadLimiter), uploadImage.single('file'), adminUploadImage);
router.delete('/uploads/:id', adminDeleteUploadedImage);

export default router;
