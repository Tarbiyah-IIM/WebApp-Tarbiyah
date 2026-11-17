import { Router } from 'express';
import {
  completeLesson,
  deleteMe,
  getMe,
  getOrderDetail,
  learnCourse,
  myCertificates,
  myCourses,
  myOrders,
  mySubscription,
  paymentWebhook,
  placeOrder,
  simulateSandboxPayment,
  submitCourseReview,
  toggleSubscriptionAutoRenew,
  updateMe
} from '../controllers/student.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  createOrderSchema,
  paymentWebhookSchema,
  reviewSchema,
  simulatePaymentSchema,
  updateProfileSchema
} from '../validators/schemas.js';

const router = Router();

router.post('/payments/webhook', validateBody(paymentWebhookSchema), paymentWebhook);

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validateBody(updateProfileSchema), updateMe);
router.delete('/me', authenticate, deleteMe);
router.get('/me/courses', authenticate, myCourses);
router.get('/me/orders', authenticate, myOrders);
router.get('/me/certificates', authenticate, myCertificates);
router.get('/subscriptions/me', authenticate, mySubscription);
router.post('/subscriptions/auto-renew', authenticate, toggleSubscriptionAutoRenew);

router.post('/orders', authenticate, validateBody(createOrderSchema), placeOrder);
router.get('/orders/:id', authenticate, getOrderDetail);
router.post('/orders/:id/simulate-payment', authenticate, validateBody(simulatePaymentSchema), simulateSandboxPayment);

router.get('/courses/:id/learn', authenticate, learnCourse);
router.post('/lessons/:id/complete', authenticate, completeLesson);
router.post('/courses/:id/reviews', authenticate, validateBody(reviewSchema), submitCourseReview);

export default router;
