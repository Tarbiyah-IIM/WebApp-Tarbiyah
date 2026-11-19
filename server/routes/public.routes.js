import { Router } from 'express';
import { deleteMe, getMe, updateMe } from '../controllers/auth.controller.js';
import { getLanding, subscribeNewsletter } from '../controllers/public.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { subscribeSchema, updateProfileSchema } from '../validators/schemas.js';

const router = Router();

router.get('/landing', getLanding);
router.post('/subscribers', validateBody(subscribeSchema), subscribeNewsletter);

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validateBody(updateProfileSchema), updateMe);
router.delete('/me', authenticate, deleteMe);

export default router;
