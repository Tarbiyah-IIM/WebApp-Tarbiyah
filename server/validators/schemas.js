import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(191),
  password: z.string().min(6).max(100)
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(6).max(100)
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  avatarUrl: z.string().trim().max(500).nullable().optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
  newPassword: z.string().min(6).max(100).optional()
});

export const coursesQuerySchema = z.object({
  category: z.string().trim().optional(),
  q: z.string().trim().optional(),
  level: z.enum(['', 'beginner', 'intermediate', 'advanced']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(6)
});

export const createOrderSchema = z.object({
  orderType: z.enum(['course', 'subscription']).default('course'),
  courseIds: z.array(z.coerce.number().int().positive()).optional(),
  paymentMethod: z.string().trim().max(60).optional()
});

export const simulatePaymentSchema = z.object({
  outcome: z.enum(['paid', 'failed']).default('paid')
});

export const paymentWebhookSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  status: z.enum(['paid', 'failed']),
  gatewayRef: z.string().trim().max(120).optional()
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(2000)
});

export const subscribeSchema = z.object({
  email: z.string().trim().email().max(191),
  source: z.string().trim().max(60).optional()
});

export const courseBodySchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  mentorId: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(220).optional(),
  subtitle: z.string().trim().max(255).optional().default(''),
  description: z.string().trim().min(10),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  price: z.coerce.number().min(0).max(100000),
  currency: z.string().trim().max(10).default('USD'),
  thumbnailUrl: z.string().trim().max(500).nullable().optional(),
  badge: z.string().trim().max(60).nullable().optional(),
  approvalStatus: z.enum(['draft', 'pending_review', 'approved', 'rejected']).optional(),
  isPublished: z.boolean().optional()
});

export const sectionBodySchema = z.object({
  courseId: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(2).max(200),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export const lessonBodySchema = z.object({
  sectionId: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(2).max(200),
  summary: z.string().trim().max(2000).optional().default(''),
  videoUrl: z.string().trim().min(5).max(500),
  durationSec: z.coerce.number().int().min(0).default(0),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isPreview: z.boolean().default(false)
});

export const categoryBodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120),
  description: z.string().trim().max(255).optional().default(''),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export const mentorBodySchema = z.object({
  userId: z.coerce.number().int().positive().nullable().optional(),
  name: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(160),
  bio: z.string().trim().max(2000).optional().default(''),
  photoUrl: z.string().trim().max(500).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true)
});

export const testimonialBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  jobTitle: z.string().trim().min(2).max(160),
  quote: z.string().trim().min(5).max(2000),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  avatarUrl: z.string().trim().max(500).nullable().optional(),
  isVisible: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export const faqBodySchema = z.object({
  question: z.string().trim().min(5).max(255),
  answer: z.string().trim().min(5).max(5000),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export const statBodySchema = z.object({
  statGroup: z.enum(['hero', 'journey']),
  label: z.string().trim().min(2).max(120),
  valueNum: z.string().trim().min(1).max(40),
  suffix: z.string().trim().max(20).default(''),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export const featureBodySchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(5).max(2000),
  icon: z.string().trim().max(60).default('check'),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export const partnerBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  logoUrl: z.string().trim().max(500).nullable().optional(),
  url: z.string().trim().max(500).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export const liveSessionBodySchema = z.object({
  courseId: z.coerce.number().int().positive(),
  mentorId: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000).optional().default(''),
  startsAt: z.string().min(10),
  durationMin: z.coerce.number().int().min(15).max(480).default(60),
  platform: z.enum(['zoom', 'google_meet']).default('zoom'),
  meetingUrl: z.string().trim().url().max(500)
});

export const communityPostSchema = z.object({
  parentId: z.coerce.number().int().positive().nullable().optional(),
  body: z.string().trim().min(2).max(3000)
});

export const learningPathGenerateSchema = z.object({
  goalTitle: z.string().trim().min(3).max(160),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  targetLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner')
});

export const learningPathReorderSchema = z.object({
  orderedItemIds: z.array(z.coerce.number().int().positive()).min(1)
});

export const adminUserUpdateSchema = z.object({
  role: z.enum(['student', 'mentor', 'admin']),
  isActive: z.boolean()
});
