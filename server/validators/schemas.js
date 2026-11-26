import { z } from 'zod';
import { detectImageMimeFromBuffer } from '../middlewares/upload.middleware.js';
import { isSafeAppUrl, isSafeHttpUrl, isSafeHttpsUrl, sanitizeSpreadsheetCell } from '../utils/security.js';

const safePasswordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(72, 'Password maksimal 72 karakter')
  .refine((val) => Buffer.byteLength(val, 'utf8') <= 72, 'Password melebihi batas 72 byte')
  .refine((val) => /[A-Za-z]/.test(val) && /[0-9]/.test(val), 'Password harus memuat huruf dan angka');

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(191),
  password: safePasswordSchema
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(256)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: safePasswordSchema
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email('Format email tidak valid').max(191).optional(),
    avatarUrl: z
      .string()
      .trim()
      .max(500)
      .nullable()
      .optional()
      .refine((v) => !v || isSafeAppUrl(v, { allowEmpty: true }), 'URL foto profil tidak valid'),
    bio: z.string().trim().max(1000).nullable().optional(),
    currentPassword: z.string().min(1).max(128).optional(),
    newPassword: safePasswordSchema.optional()
  })
  .superRefine((data, ctx) => {
    if ((data.newPassword || data.email) && !data.currentPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['currentPassword'],
        message: 'Password saat ini wajib diisi untuk mengubah email atau password'
      });
    }
  });

export const subscribeSchema = z.object({
  email: z.string().trim().email().max(191),
  source: z.string().trim().max(60).optional()
});

function isSafeNewsLink(value, { allowHash = false } = {}) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/[\r\n\t]/.test(trimmed)) return false;
  if (allowHash && trimmed === '#') return true;
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//') && !trimmed.includes('\\');
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
    sortOrder: z.coerce.number().int().min(0).max(2147483647).default(0)
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
  sortOrder: z.coerce.number().int().min(0).max(2147483647).default(0)
});

export const faqBodySchema = z.object({
  question: z.string().trim().min(5).max(255),
  answer: z.string().trim().min(5).max(5000),
  sortOrder: z.coerce.number().int().min(0).max(2147483647).default(0)
});

export const statBodySchema = z.object({
  statGroup: z.enum(['hero', 'journey']),
  label: z.string().trim().min(2).max(120),
  valueNum: z.string().trim().min(1).max(40),
  suffix: z.string().trim().max(20).default(''),
  sortOrder: z.coerce.number().int().min(0).max(2147483647).default(0)
});

export const featureBodySchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(5).max(2000),
  icon: z.string().trim().max(60).default('check'),
  sortOrder: z.coerce.number().int().min(0).max(2147483647).default(0)
});

export const partnerBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  logoUrl: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .refine((v) => !v || isSafeAppUrl(v, { allowEmpty: true }), 'URL logo layanan tidak valid'),
  url: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .refine((v) => !v || isSafeAppUrl(v, { allowEmpty: true, allowHash: true }), 'URL tujuan layanan tidak valid'),
  sortOrder: z.coerce.number().int().min(0).max(2147483647).default(0)
});

const optionalSafeMediaOrWebUrl = (message) =>
  z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .refine((v) => !v || isSafeAppUrl(v, { allowEmpty: true }), message)
    .default('');

const optionalSafeExternalUrl = (message) =>
  z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .refine((v) => !v || isSafeHttpUrl(v), message)
    .default('');

const educationHistoryItemSchema = z.object({
  degreeLevel: z.string().trim().min(1, 'Jenjang pendidikan wajib diisi').max(20),
  institution: z.string().trim().min(1, 'Perguruan tinggi wajib diisi').max(160),
  major: z.string().trim().min(1, 'Jurusan wajib diisi').max(160),
  academicDegree: z.string().trim().max(40).nullable().optional().default(''),
  graduationYear: z.string().trim().max(12).nullable().optional().default('')
});

export const lecturerBodySchema = z.object({
  programSlug: z.enum(['pai', 'pgmi', 'piaud']),
  name: z.string().trim().min(2, 'Nama dosen minimal 2 karakter').max(160),
  photoUrl: optionalSafeMediaOrWebUrl('URL foto dosen tidak valid'),
  nidn: z.string().trim().max(40).nullable().optional().default(''),
  teachingStatus: z.enum(['active', 'study_leave', 'inactive']).default('active'),
  academicRank: z.string().trim().max(80).nullable().optional().default(''),
  rankGrade: z.string().trim().max(40).nullable().optional().default(''),
  leadershipRole: z.string().trim().max(100).nullable().optional().default(''),
  email: z
    .string()
    .trim()
    .max(191)
    .nullable()
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Format email dosen tidak valid')
    .default(''),
  education: z.string().trim().max(200).nullable().optional().default(''),
  biography: z.string().trim().max(15000).nullable().optional().default(''),
  educationHistory: z.array(educationHistoryItemSchema).max(15, 'Maksimal 15 riwayat pendidikan').default([]),
  scholarUrl: optionalSafeExternalUrl('URL Google Scholar tidak valid'),
  orcidUrl: optionalSafeExternalUrl('URL ORCID tidak valid'),
  scopusUrl: optionalSafeExternalUrl('URL Scopus tidak valid'),
  sintaUrl: optionalSafeExternalUrl('URL SINTA tidak valid'),
  wosUrl: optionalSafeExternalUrl('URL Web of Science tidak valid'),
  isVisible: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(2147483647).default(0)
});

export const adminUserUpdateSchema = z.object({
  role: z.enum(['student', 'mentor', 'admin']),
  isActive: z.boolean()
});

const URL_FIELD_KEYS = new Set([
  'href',
  'url',
  'pmbUrl',
  'accreditationUrl',
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
  if (/[\r\n\t]/.test(trimmed) || trimmed.includes('\\')) return false;
  if (key === 'guestLectureUrl') {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'https:' && parsed.hostname === 'script.google.com';
    } catch {
      return false;
    }
  }
  if (key === 'mapsEmbedUrl') {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'https:') return false;
      if (parsed.hostname === 'maps.google.com') return true;
      return parsed.hostname === 'www.google.com' && (parsed.pathname === '/maps' || parsed.pathname.startsWith('/maps/'));
    } catch {
      return false;
    }
  }
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:';
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

const ALLOWED_STATIC_SETTING_KEYS = new Set([
  'hero_tagline',
  'hero_title',
  'hero_subtitle',
  'footer_cta_title',
  'footer_cta_subtitle'
]);

const ALLOWED_CMS_SETTING_KEYS = new Set([
  'cms_nav_links',
  'cms_contacts',
  'cms_programs',
  'cms_info_pages',
  'cms_profile'
]);

function spreadsheetCell(max, message) {
  return z
    .string()
    .trim()
    .transform(sanitizeSpreadsheetCell)
    .pipe(z.string().max(max, message));
}

const MAX_GUEST_PHOTO_BYTES = 1650000;

function isAllowedSettingKey(key) {
  return ALLOWED_STATIC_SETTING_KEYS.has(key) || ALLOWED_CMS_SETTING_KEYS.has(key);
}

function decodeBase64ImageBuffer(rawBase64) {
  const cleaned = String(rawBase64 || '').replace(/^data:image\/[a-z0-9.+-]+;base64,/i, '').trim();
  if (!cleaned || cleaned.length % 4 === 1 || !/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) {
    return null;
  }
  const buffer = Buffer.from(cleaned, 'base64');
  return buffer.length > 0 ? buffer : null;
}

export const adminSettingsUpdateSchema = z
  .record(
    z
      .string()
      .regex(/^[a-z0-9_]{1,100}$/, 'Kunci pengaturan hanya boleh huruf kecil, angka, dan underscore')
      .refine((key) => isAllowedSettingKey(key), 'Kunci pengaturan tidak terdaftar pada konfigurasi CMS'),
    z.union([z.string(), z.number(), z.boolean(), z.null()]).transform((val) => (val === null ? '' : String(val)))
  )
  .superRefine((obj, ctx) => {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Minimal satu pengaturan harus dikirim' });
      return;
    }
    for (const [key, value] of Object.entries(obj)) {
      if (Buffer.byteLength(value, 'utf8') > 60000) {
        ctx.addIssue({ code: 'custom', path: [key], message: `Nilai ${key} melebihi batas ukuran 60 KB` });
        continue;
      }
      if (key.startsWith('cms_') && value.trim()) {
        try {
          const parsed = JSON.parse(value);
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            ctx.addIssue({ code: 'custom', path: [key], message: `Format ${key} harus berupa objek JSON` });
            continue;
          }
          if (key === 'cms_nav_links') {
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
  kepada: spreadsheetCell(150, 'Kepada (Yth.) terlalu panjang.').pipe(z.string().min(1, 'Kepada (Yth.) wajib diisi.')),
  nama_mahasiswa: spreadsheetCell(120, 'Nama Mahasiswa terlalu panjang.').pipe(z.string().min(1, 'Nama Mahasiswa wajib diisi.')),
  nim: z
    .string()
    .trim()
    .min(3, 'NIM minimal terdiri dari 3 karakter.')
    .max(30)
    .regex(/^[A-Za-z0-9.\-\/]+$/, 'NIM hanya boleh berisi huruf, angka, titik, garis miring, atau tanda hubung.')
    .refine((v) => !/^[=+\-@\t\r]/.test(v), 'NIM tidak boleh diawali karakter operator.'),
  program_studi: z.enum([
    'Pendidikan Agama Islam',
    'Pendidikan Guru Madrasah Ibtidaiyah',
    'Pendidikan Islam Anak Usia Dini'
  ]),
  semester: z.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']),
  tempat_ppl: spreadsheetCell(150, 'Tempat PPL terlalu panjang.').pipe(z.string().min(1, 'Tempat PPL wajib diisi.')),
  alamat_ppl: spreadsheetCell(300, 'Alamat PPL terlalu panjang.').pipe(z.string().min(1, 'Alamat PPL wajib diisi.'))
});

const guestLectureFotoFileSchema = z.object({
  filename: z.string().trim().min(1).max(200).transform(sanitizeSpreadsheetCell),
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
    prodi: spreadsheetCell(40).default(''),
    dosenPengampu: spreadsheetCell(160).default(''),
    dosenTamu: spreadsheetCell(240).default(''),
    mataKuliah: spreadsheetCell(200).default(''),
    tema: spreadsheetCell(1000).default(''),
    tanggal: spreadsheetCell(40).default(''),
    jam: spreadsheetCell(80).default(''),
    peserta: spreadsheetCell(40).default('100'),
    existingFotoUrl: z
      .string()
      .trim()
      .max(2000)
      .default('')
      .refine((v) => {
        if (!v) return true;
        const lines = v
          .split(/[\r\n]+/)
          .map((line) => line.trim())
          .filter(Boolean);
        return lines.length <= 3 && lines.every((line) => isSafeHttpUrl(line));
      }, 'URL foto tidak valid'),
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
    const existingLines = (data.existingFotoUrl || '')
      .split(/[\r\n]+/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (existingLines.length + data.fotoFiles.length > 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['fotoFiles'],
        message: 'Total foto narasumber (lama + baru) maksimal 3 file.'
      });
    }
    data.fotoFiles.forEach((file, index) => {
      const buf = decodeBase64ImageBuffer(file.base64);
      if (!buf || buf.length > MAX_GUEST_PHOTO_BYTES) {
        ctx.addIssue({
          code: 'custom',
          path: ['fotoFiles', index, 'base64'],
          message: 'Data file gambar foto tidak valid atau melebihi batas ukuran.'
        });
        return;
      }
      const detectedMime = detectImageMimeFromBuffer(buf);
      if (!detectedMime || detectedMime !== file.mimeType) {
        ctx.addIssue({
          code: 'custom',
          path: ['fotoFiles', index, 'mimeType'],
          message: 'Tanda biner file foto tidak sesuai tipe gambar JPG, PNG, WebP, atau GIF.'
        });
      }
    });
  });
