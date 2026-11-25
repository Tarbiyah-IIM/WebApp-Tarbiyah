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

function isSafeNewsLink(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '#') return true;
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export const testimonialBodySchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    jobTitle: z.string().trim().min(2).max(160),
    quote: z.string().trim().min(5).max(2000).optional(),
    fullContent: z.string().trim().min(5).max(100000).nullable().optional(),
    rating: z.coerce.number().int().min(1).max(5).default(5),
    avatarUrl: z
      .string()
      .trim()
      .max(500)
      .nullable()
      .optional()
      .refine((v) => !v || isSafeNewsLink(v), 'URL gambar cover tidak valid'),
    galleryUrls: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(500)
          .refine((v) => isSafeNewsLink(v), 'URL foto dokumentasi tidak valid')
      )
      .max(20)
      .optional()
      .default([]),
    slideshowPosition: z.enum(['top', 'middle', 'bottom', 'none']).default('bottom'),
    categoryId: z.coerce.number().int().positive().optional(),
    categoryIds: z.array(z.coerce.number().int().positive()).max(20).optional(),
    isVisible: z.boolean().default(true),
    sortOrder: z.coerce.number().int().min(0).default(0)
  })
  .superRefine((data, ctx) => {
    const hasCategoryIds = Array.isArray(data.categoryIds) && data.categoryIds.length > 0;
    const hasSingleCategory = Boolean(data.categoryId);
    if (!hasCategoryIds && !hasSingleCategory) {
      ctx.addIssue({
        code: 'custom',
        path: ['categoryIds'],
        message: 'Pilih minimal satu kategori berita'
      });
    }
    const hasContent = Boolean(data.fullContent?.trim()) || Boolean(data.quote?.trim());
    if (!hasContent) {
      ctx.addIssue({
        code: 'custom',
        path: ['fullContent'],
        message: 'Isi berita lengkap wajib diisi'
      });
    }
  });

export const newsCategoryBodySchema = z.object({
  name: z.string().trim().min(2).max(100)
});

export const agendaBodySchema = z.object({
  title: z.string().trim().min(2).max(160),
  eventDate: z.string().trim().min(2).max(100),
  eventTime: z.string().trim().max(80).nullable().optional(),
  description: z.string().trim().min(5).max(100000),
  coverUrl: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .refine((v) => !v || isSafeNewsLink(v), 'URL gambar cover agenda tidak valid'),
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

export const adminUserUpdateSchema = z.object({
  role: z.enum(['student', 'mentor', 'admin']),
  isActive: z.boolean()
});

const URL_FIELD_KEYS = new Set([
  'href',
  'url',
  'pmbUrl',
  'modalUrl',
  'externalUrl',
  'imageUrl',
  'structureImageUrl',
  'waAdminUrl',
  'waPmbUrl',
  'mapsEmbedUrl',
  'guestLectureUrl'
]);

function isSafePortalUrl(value, key) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (key === 'guestLectureUrl') {
    return trimmed.startsWith('https://script.google.com/');
  }
  if (key === 'mapsEmbedUrl') {
    return trimmed.startsWith('https://www.google.com/maps');
  }
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function validateNestedCmsUrls(node, path = '') {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i += 1) {
      const err = validateNestedCmsUrls(node[i], `${path}[${i}]`);
      if (err) return err;
    }
    return null;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      const nextPath = path ? `${path}.${k}` : k;
      if (URL_FIELD_KEYS.has(k) && v !== null && v !== undefined) {
        if (!isSafePortalUrl(String(v), k)) {
          return `URL tidak valid pada ${nextPath}`;
        }
      } else {
        const err = validateNestedCmsUrls(v, nextPath);
        if (err) return err;
      }
    }
  }
  return null;
}

export const adminSettingsUpdateSchema = z
  .record(
    z.string().regex(/^[a-z0-9_]{1,100}$/, 'Kunci pengaturan hanya boleh huruf kecil, angka, dan underscore'),
    z.union([z.string(), z.number(), z.boolean(), z.null()]).transform((val) => (val === null ? '' : String(val)))
  )
  .superRefine((obj, ctx) => {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Minimal satu pengaturan harus dikirim' });
      return;
    }
    for (const [key, value] of Object.entries(obj)) {
      if (value.length > 60000) {
        ctx.addIssue({ code: 'custom', path: [key], message: `Nilai ${key} terlalu panjang` });
        continue;
      }
      if (key.startsWith('cms_') && value.trim()) {
        try {
          const parsed = JSON.parse(value);
          if (key === 'cms_nav_links') {
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
              ctx.addIssue({ code: 'custom', path: [key], message: 'Format cms_nav_links harus objek' });
              continue;
            }
            for (const [navKey, navVal] of Object.entries(parsed)) {
              if (navVal !== null && navVal !== undefined && !isSafePortalUrl(String(navVal), navKey)) {
                ctx.addIssue({ code: 'custom', path: [key, navKey], message: `URL tidak valid pada ${key}.${navKey}` });
              }
            }
            continue;
          }
          const urlErr = validateNestedCmsUrls(parsed, key);
          if (urlErr) {
            ctx.addIssue({ code: 'custom', path: [key], message: urlErr });
          }
        } catch {
          ctx.addIssue({ code: 'custom', path: [key], message: `Format JSON tidak valid pada ${key}` });
        }
      }
    }
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

const guestLectureFotoFileSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  base64: z
    .string()
    .trim()
    .min(16, 'Data gambar tidak valid.')
    .max(2200000, 'Ukuran file gambar terlalu besar setelah optimasi.')
});

export const guestLectureSubmitSchema = z
  .object({
    mode: z.enum(['new', 'update']).default('new'),
    rowIndex: z.coerce.number().int().min(3).max(50000).nullable().optional(),
    prodi: z.string().trim().max(40).default(''),
    dosenPengampu: z.string().trim().max(160).default(''),
    dosenTamu: z.string().trim().max(240).default(''),
    mataKuliah: z.string().trim().max(200).default(''),
    tema: z.string().trim().max(1000).default(''),
    tanggal: z.string().trim().max(40).default(''),
    jam: z.string().trim().max(80).default(''),
    peserta: z.string().trim().max(40).default('100'),
    existingFotoUrl: z.string().trim().max(2000).default(''),
    fotoFiles: z.array(guestLectureFotoFileSchema).max(3, 'Maksimal 3 foto narasumber.').default([])
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'update' && !data.rowIndex) {
      ctx.addIssue({
        code: 'custom',
        path: ['rowIndex'],
        message: 'Nomor baris agenda wajib disertakan saat memperbarui data.'
      });
    }
    const hasCore = Boolean(
      data.prodi ||
        data.dosenPengampu ||
        data.dosenTamu ||
        data.mataKuliah ||
        data.tema ||
        data.tanggal ||
        data.jam
    );
    if (!hasCore) {
      ctx.addIssue({
        code: 'custom',
        path: ['mataKuliah'],
        message: 'Isi minimal satu informasi agenda kuliah tamu.'
      });
    }
  });
