import { Router } from 'express';
import { deleteMe, getMe, updateMe } from '../controllers/auth.controller.js';
import { getGuestLectureData, submitGuestLecture } from '../controllers/guestLecture.controller.js';
import { getWorkPermitMeta, submitWorkPermit } from '../controllers/permit.controller.js';
import { getLanding, getPublicMedia, getPublicNewsDetail, subscribeNewsletter } from '../controllers/public.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { guestLectureSubmitSchema, pplWorkPermitSchema, subscribeSchema, updateProfileSchema } from '../validators/schemas.js';

const router = Router();

router.get('/landing', getLanding);
router.get('/news/:id', getPublicNewsDetail);
router.get('/media/:id', getPublicMedia);
router.post('/subscribers', validateBody(subscribeSchema), subscribeNewsletter);
router.get('/permits/work-permit/meta', getWorkPermitMeta);
router.post('/permits/work-permit', validateBody(pplWorkPermitSchema), submitWorkPermit);
router.get('/guest-lectures', getGuestLectureData);
router.post('/guest-lectures', validateBody(guestLectureSubmitSchema), submitGuestLecture);

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validateBody(updateProfileSchema), updateMe);
router.delete('/me', authenticate, deleteMe);

export default router;
