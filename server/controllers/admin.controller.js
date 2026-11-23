import { invalidateLandingCache } from '../config/cache.js';
import { ALLOWED_IMAGE_MIME_TO_EXT, detectImageMimeFromBuffer } from '../middlewares/upload.middleware.js';
import { AppError } from '../middlewares/error.middleware.js';
import {
  createMediaFile,
  deleteMediaFileIfUnreferenced,
  extractMediaId,
  findTestimonialAvatarUrl
} from '../models/media.model.js';
import {
  createFaq,
  createFeature,
  createNewsCategory,
  createPartner,
  createStat,
  createTestimonial,
  deleteFaq,
  deleteFeature,
  deleteNewsCategory,
  deletePartner,
  deleteStat,
  deleteTestimonial,
  getPortalOverviewStats,
  getSettingsMap,
  listFaqsAdmin,
  listFeaturesAdmin,
  listNewsCategoriesAdmin,
  listPartnersAdmin,
  listStatsAdmin,
  listTestimonialsAdmin,
  updateFaq,
  updateFeature,
  updatePartner,
  updateStat,
  updateTestimonial,
  upsertSettings
} from '../models/landing.model.js';
import { listUsersAdmin, updateUserRoleAndStatusAdmin } from '../models/user.model.js';

export async function getAdminOverview(_req, res, next) {
  try {
    const stats = await getPortalOverviewStats();
    return res.json({ stats });
  } catch (err) {
    return next(err);
  }
}

export async function adminListUsers(_req, res, next) {
  try {
    const items = await listUsersAdmin();
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateUser(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user.id && req.body.role !== 'admin') {
      return next(new AppError(400, 'SELF_DEMOTE_FORBIDDEN', 'Tidak dapat menurunkan peran akun admin yang sedang digunakan'));
    }
    const user = await updateUserRoleAndStatusAdmin(targetId, req.body);
    if (!user) {
      return next(new AppError(404, 'USER_NOT_FOUND', 'Pengguna tidak ditemukan'));
    }
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

export async function adminListTestimonials(_req, res, next) {
  try {
    return res.json({ items: await listTestimonialsAdmin() });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateTestimonial(req, res, next) {
  try {
    const item = await createTestimonial(req.body);
    invalidateLandingCache();
    return res.status(201).json({ testimonial: item });
  } catch (err) {
    return next(err);
  }
}

async function cleanupUnusedMedia(url) {
  const mediaId = extractMediaId(url);
  if (mediaId) {
    await deleteMediaFileIfUnreferenced(mediaId);
  }
}

export async function adminUpdateTestimonial(req, res, next) {
  try {
    const id = Number(req.params.id);
    const oldAvatarUrl = await findTestimonialAvatarUrl(id);
    const item = await updateTestimonial(id, req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Berita tidak ditemukan'));
    if (oldAvatarUrl && oldAvatarUrl !== item.avatar_url) {
      await cleanupUnusedMedia(oldAvatarUrl);
    }
    invalidateLandingCache();
    return res.json({ testimonial: item });
  } catch (err) {
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') {
      return next(new AppError(400, 'INVALID_CATEGORY', 'Kategori berita tidak valid'));
    }
    return next(err);
  }
}

export async function adminDeleteTestimonial(req, res, next) {
  try {
    const id = Number(req.params.id);
    const oldAvatarUrl = await findTestimonialAvatarUrl(id);
    const ok = await deleteTestimonial(id);
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Berita tidak ditemukan'));
    await cleanupUnusedMedia(oldAvatarUrl);
    invalidateLandingCache();
    return res.json({ message: 'Berita dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListNewsCategories(_req, res, next) {
  try {
    return res.json({ items: await listNewsCategoriesAdmin() });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateNewsCategory(req, res, next) {
  try {
    const item = await createNewsCategory(req.body);
    return res.status(201).json({ category: item });
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return next(new AppError(409, 'CATEGORY_EXISTS', 'Kategori berita sudah tersedia'));
    }
    return next(err);
  }
}

export async function adminDeleteNewsCategory(req, res, next) {
  try {
    const result = await deleteNewsCategory(Number(req.params.id));
    if (result.inUse) {
      return next(new AppError(409, 'CATEGORY_IN_USE', 'Kategori masih dipakai berita'));
    }
    if (!result.deleted) return next(new AppError(404, 'NOT_FOUND', 'Kategori berita tidak ditemukan'));
    return res.json({ message: 'Kategori berita dihapus' });
  } catch (err) {
    if (err?.code === 'ER_ROW_IS_REFERENCED_2') {
      return next(new AppError(409, 'CATEGORY_IN_USE', 'Kategori masih dipakai berita'));
    }
    return next(err);
  }
}

export async function adminListFaqs(_req, res, next) {
  try {
    return res.json({ items: await listFaqsAdmin() });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateFaq(req, res, next) {
  try {
    const item = await createFaq(req.body);
    invalidateLandingCache();
    return res.status(201).json({ faq: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateFaq(req, res, next) {
  try {
    const item = await updateFaq(Number(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'FAQ tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ faq: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteFaq(req, res, next) {
  try {
    const ok = await deleteFaq(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'FAQ tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'FAQ dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListStats(_req, res, next) {
  try {
    return res.json({ items: await listStatsAdmin() });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateStat(req, res, next) {
  try {
    const item = await createStat(req.body);
    invalidateLandingCache();
    return res.status(201).json({ stat: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateStat(req, res, next) {
  try {
    const item = await updateStat(Number(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Statistik tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ stat: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteStat(req, res, next) {
  try {
    const ok = await deleteStat(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Statistik tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'Statistik dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListFeatures(_req, res, next) {
  try {
    return res.json({ items: await listFeaturesAdmin() });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateFeature(req, res, next) {
  try {
    const item = await createFeature(req.body);
    invalidateLandingCache();
    return res.status(201).json({ feature: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateFeature(req, res, next) {
  try {
    const item = await updateFeature(Number(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Fitur tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ feature: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteFeature(req, res, next) {
  try {
    const ok = await deleteFeature(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Fitur tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'Fitur dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListPartners(_req, res, next) {
  try {
    return res.json({ items: await listPartnersAdmin() });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreatePartner(req, res, next) {
  try {
    const item = await createPartner(req.body);
    invalidateLandingCache();
    return res.status(201).json({ partner: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdatePartner(req, res, next) {
  try {
    const item = await updatePartner(Number(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Layanan tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ partner: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeletePartner(req, res, next) {
  try {
    const ok = await deletePartner(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Layanan tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'Layanan dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminGetSettings(_req, res, next) {
  try {
    return res.json({ settings: await getSettingsMap() });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateSettings(req, res, next) {
  try {
    const settings = await upsertSettings(req.body);
    invalidateLandingCache();
    return res.json({ settings });
  } catch (err) {
    return next(err);
  }
}

export async function adminUploadImage(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return next(new AppError(400, 'NO_FILE', 'File gambar tidak ditemukan'));
    }
    const detectedMime = detectImageMimeFromBuffer(req.file.buffer);
    if (!detectedMime || detectedMime !== req.file.mimetype) {
      return next(new AppError(400, 'INVALID_IMAGE_SIGNATURE', 'File bukan gambar JPG, PNG, WebP, atau GIF yang valid'));
    }
    const created = await createMediaFile({
      originalName: req.file.originalname,
      mimeType: detectedMime,
      data: req.file.buffer,
      uploadedBy: req.user?.id || null
    });
    const ext = ALLOWED_IMAGE_MIME_TO_EXT[detectedMime] || '.png';
    return res.status(201).json({
      id: created.id,
      url: created.url,
      filename: `${created.id}${ext}`,
      sizeBytes: created.sizeBytes,
      storage: 'mysql'
    });
  } catch (err) {
    return next(err);
  }
}
