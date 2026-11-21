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

export const subscribeSchema = z.object({
  email: z.string().trim().email().max(191),
  source: z.string().trim().max(60).optional()
});

export const testimonialBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  jobTitle: z.string().trim().min(2).max(160),
  quote: z.string().trim().min(5).max(2000),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  avatarUrl: z.string().trim().max(500).nullable().optional(),
  categoryId: z.coerce.number().int().positive(),
  isVisible: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export const newsCategoryBodySchema = z.object({
  name: z.string().trim().min(2).max(100)
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

export const adminUserUpdateSchema = z.object({
  role: z.enum(['student', 'mentor', 'admin']),
  isActive: z.boolean()
});

export const pplWorkPermitSchema = z.object({
  kepada: z.string().trim().min(1, 'Kepada (Yth.) wajib diisi.').max(150),
  nama_mahasiswa: z.string().trim().min(1, 'Nama Mahasiswa wajib diisi.').max(120),
  nim: z
    .string()
    .trim()
    .min(3, 'NIM minimal terdiri dari 3 karakter.')
    .max(30)
    .regex(/^[A-Za-z0-9.\-\/]+$/, 'NIM hanya boleh berisi huruf, angka, titik, garis miring, atau tanda hubung.'),
  program_studi: z.enum([
    'Pendidikan Agama Islam',
    'Pendidikan Guru Madrasah Ibtidaiyah',
    'Pendidikan Islam Anak Usia Dini'
  ]),
  semester: z.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']),
  tempat_ppl: z.string().trim().min(1, 'Tempat PPL wajib diisi.').max(150),
  alamat_ppl: z.string().trim().min(1, 'Alamat PPL wajib diisi.').max(300)
});
