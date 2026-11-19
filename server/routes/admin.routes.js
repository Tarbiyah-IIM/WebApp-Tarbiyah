import { Router } from 'express';
import {
  adminCreateFaq,
  adminCreateFeature,
  adminCreatePartner,
  adminCreateStat,
  adminCreateTestimonial,
  adminDeleteFaq,
  adminDeleteFeature,
  adminDeletePartner,
  adminDeleteStat,
  adminDeleteTestimonial,
  adminGetSettings,
  adminListFaqs,
  adminListFeatures,
  adminListPartners,
  adminListStats,
  adminListTestimonials,
  adminListUsers,
  adminUpdateFaq,
  adminUpdateFeature,
  adminUpdatePartner,
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
  faqBodySchema,
  featureBodySchema,
  partnerBodySchema,
  statBodySchema,
  testimonialBodySchema
} from '../validators/schemas.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/overview', getAdminOverview);
router.get('/users', adminListUsers);
router.patch('/users/:id', validateBody(adminUserUpdateSchema), adminUpdateUser);

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

router.post('/uploads', uploadImage.single('file'), adminUploadImage);

export default router;
