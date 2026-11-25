import { invalidateLandingCache } from '../config/cache.js';
import { listAdminAuditLog, recordAdminAction } from '../models/audit.model.js';
import { readPagination } from '../utils/pagination.js';
import { ALLOWED_IMAGE_MIME_TO_EXT, detectImageMimeFromBuffer } from '../middlewares/upload.middleware.js';
import { AppError } from '../middlewares/error.middleware.js';
import {
  createMediaFile,
  deleteMediaFileIfUnreferenced,
  extractMediaId,
  findAgendaMediaUrls,
  findPartnerLogoUrl,
  findTestimonialMediaUrls,
  isValidMediaId
} from '../models/media.model.js';
import {
  createAgenda,
  createFaq,
  createFeature,
  createNewsCategory,
  createPartner,
  createStat,
  createTestimonial,
  deleteAgenda,
  deleteFaq,
  deleteFeature,
  deleteNewsCategory,
  deletePartner,
  deleteStat,
  deleteTestimonial,
  getPortalOverviewStats,
  getSettingsMap,
  listAgendasAdmin,
  listFaqsAdmin,
  listFeaturesAdmin,
  listNewsCategoriesAdmin,
  listPartnersAdmin,
  listStatsAdmin,
  listTestimonialsAdmin,
  updateAgenda,
  updateFaq,
  updateFeature,
  updatePartner,
  updateStat,
  updateTestimonial,
  upsertSettings
} from '../models/landing.model.js';
import { listUsersAdmin, revokeAllUserRefreshTokens, updateUserRoleAndStatusAdmin } from '../models/user.model.js';

function parsePositiveId(rawValue) {
  const numeric = Number(rawValue);
  if (!Number.isSafeInteger(numeric) || numeric <= 0 || numeric > 4294967295) {
    throw new AppError(400, 'INVALID_ID', 'Parameter ID harus berupa bilangan bulat positif');
  }
  return numeric;
}

export async function getAdminOverview(_req, res, next) {
  try {
    const stats = await getPortalOverviewStats();
    return res.json({ stats });
  } catch (err) {
    return next(err);
  }
}

export async function adminListUsers(req, res, next) {
  try {
    const items = await listUsersAdmin(readPagination(req.query) ?? {});
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateUser(req, res, next) {
  try {
    const targetId = parsePositiveId(req.params.id);
    if (targetId === req.user.id && req.body.role !== 'admin') {
      return next(new AppError(400, 'SELF_DEMOTE_FORBIDDEN', 'Tidak dapat menurunkan peran akun admin yang sedang digunakan'));
    }
    if (targetId === req.user.id && req.body.isActive === false) {
      return next(new AppError(400, 'SELF_SUSPEND_FORBIDDEN', 'Tidak dapat menonaktifkan akun admin yang sedang digunakan'));
    }
    const user = await updateUserRoleAndStatusAdmin(targetId, req.body);
    if (!user) {
      return next(new AppError(404, 'USER_NOT_FOUND', 'Pengguna tidak ditemukan'));
    }
    if (!user.is_active || user.role !== 'admin') {
      await revokeAllUserRefreshTokens(targetId);
    }
    await recordAdminAction(req, { action: 'update', entity: 'user', entityId: targetId, detail: { role: req.body.role, isActive: req.body.isActive } });
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

export async function adminListTestimonials(req, res, next) {
  try {
    return res.json({ items: await listTestimonialsAdmin(readPagination(req.query) ?? {}) });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateTestimonial(req, res, next) {
  try {
    const item = await createTestimonial(req.body);
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'create', entity: 'testimonial', entityId: item?.id, detail: { name: req.body.name } });
    return res.status(201).json({ testimonial: item });
  } catch (err) {
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') {
      return next(new AppError(400, 'INVALID_CATEGORY', 'Kategori berita tidak valid'));
    }
    return next(err);
  }
}

async function cleanupUnusedMediaList(urls) {
  const seen = new Set();
  for (const url of urls || []) {
    const mediaId = extractMediaId(url);
    if (mediaId && !seen.has(mediaId)) {
      seen.add(mediaId);
      await deleteMediaFileIfUnreferenced(mediaId);
    }
  }
}

export async function adminUpdateTestimonial(req, res, next) {
  try {
    const id = parsePositiveId(req.params.id);
    const oldUrls = await findTestimonialMediaUrls(id);
    const item = await updateTestimonial(id, req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Berita tidak ditemukan'));
    const nextUrlSet = new Set([
      ...(item.avatar_url ? [item.avatar_url] : []),
      ...(Array.isArray(item.gallery_urls) ? item.gallery_urls : [])
    ]);
    const removedUrls = oldUrls.filter((url) => !nextUrlSet.has(url));
    if (removedUrls.length > 0) {
      await cleanupUnusedMediaList(removedUrls);
    }
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'update', entity: 'testimonial', entityId: req.params.id, detail: { name: req.body.name } });
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
    const id = parsePositiveId(req.params.id);
    const oldUrls = await findTestimonialMediaUrls(id);
    const ok = await deleteTestimonial(id);
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Berita tidak ditemukan'));
    await cleanupUnusedMediaList(oldUrls);
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'delete', entity: 'testimonial', entityId: id, detail: null });
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
    await recordAdminAction(req, { action: 'create', entity: 'news_category', entityId: item?.id, detail: { name: req.body.name } });
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
    const result = await deleteNewsCategory(parsePositiveId(req.params.id));
    if (result.inUse) {
      return next(new AppError(409, 'CATEGORY_IN_USE', 'Kategori masih dipakai berita'));
    }
    if (!result.deleted) return next(new AppError(404, 'NOT_FOUND', 'Kategori berita tidak ditemukan'));
    await recordAdminAction(req, { action: 'delete', entity: 'news_category', entityId: req.params.id, detail: null });
    return res.json({ message: 'Kategori berita dihapus' });
  } catch (err) {
    if (err?.code === 'ER_ROW_IS_REFERENCED_2') {
      return next(new AppError(409, 'CATEGORY_IN_USE', 'Kategori masih dipakai berita'));
    }
    return next(err);
  }
}

export async function adminListAgendas(req, res, next) {
  try {
    return res.json({ items: await listAgendasAdmin(readPagination(req.query) ?? {}) });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateAgenda(req, res, next) {
  try {
    const item = await createAgenda(req.body);
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'create', entity: 'agenda', entityId: item?.id, detail: { title: req.body.title } });
    return res.status(201).json({ agenda: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateAgenda(req, res, next) {
  try {
    const id = parsePositiveId(req.params.id);
    const oldUrls = await findAgendaMediaUrls(id);
    const item = await updateAgenda(id, req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Agenda tidak ditemukan'));
    const nextUrlSet = new Set(item.cover_url ? [item.cover_url] : []);
    const removedUrls = oldUrls.filter((url) => !nextUrlSet.has(url));
    if (removedUrls.length > 0) {
      await cleanupUnusedMediaList(removedUrls);
    }
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'update', entity: 'agenda', entityId: req.params.id, detail: { title: req.body.title } });
    return res.json({ agenda: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteAgenda(req, res, next) {
  try {
    const id = parsePositiveId(req.params.id);
    const oldUrls = await findAgendaMediaUrls(id);
    const ok = await deleteAgenda(id);
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Agenda tidak ditemukan'));
    await cleanupUnusedMediaList(oldUrls);
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'delete', entity: 'agenda', entityId: id, detail: null });
    return res.json({ message: 'Agenda dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListFaqs(req, res, next) {
  try {
    return res.json({ items: await listFaqsAdmin(readPagination(req.query) ?? {}) });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateFaq(req, res, next) {
  try {
    const item = await createFaq(req.body);
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'create', entity: 'faq', entityId: item?.id, detail: { question: req.body.question } });
    return res.status(201).json({ faq: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateFaq(req, res, next) {
  try {
    const item = await updateFaq(parsePositiveId(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'FAQ tidak ditemukan'));
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'update', entity: 'faq', entityId: req.params.id, detail: { question: req.body.question } });
    return res.json({ faq: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteFaq(req, res, next) {
  try {
    const ok = await deleteFaq(parsePositiveId(req.params.id));
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'FAQ tidak ditemukan'));
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'delete', entity: 'faq', entityId: req.params.id, detail: null });
    return res.json({ message: 'FAQ dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListStats(req, res, next) {
  try {
    return res.json({ items: await listStatsAdmin(readPagination(req.query) ?? {}) });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateStat(req, res, next) {
  try {
    const item = await createStat(req.body);
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'create', entity: 'stat', entityId: item?.id, detail: { label: req.body.label } });
    return res.status(201).json({ stat: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateStat(req, res, next) {
  try {
    const item = await updateStat(parsePositiveId(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Statistik tidak ditemukan'));
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'update', entity: 'stat', entityId: req.params.id, detail: { label: req.body.label } });
    return res.json({ stat: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteStat(req, res, next) {
  try {
    const ok = await deleteStat(parsePositiveId(req.params.id));
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Statistik tidak ditemukan'));
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'delete', entity: 'stat', entityId: req.params.id, detail: null });
    return res.json({ message: 'Statistik dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListFeatures(req, res, next) {
  try {
    return res.json({ items: await listFeaturesAdmin(readPagination(req.query) ?? {}) });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreateFeature(req, res, next) {
  try {
    const item = await createFeature(req.body);
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'create', entity: 'feature', entityId: item?.id, detail: { title: req.body.title } });
    return res.status(201).json({ feature: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdateFeature(req, res, next) {
  try {
    const item = await updateFeature(parsePositiveId(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Fitur tidak ditemukan'));
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'update', entity: 'feature', entityId: req.params.id, detail: { title: req.body.title } });
    return res.json({ feature: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteFeature(req, res, next) {
  try {
    const ok = await deleteFeature(parsePositiveId(req.params.id));
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Fitur tidak ditemukan'));
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'delete', entity: 'feature', entityId: req.params.id, detail: null });
    return res.json({ message: 'Fitur dihapus' });
  } catch (err) {
    return next(err);
  }
}

export async function adminListPartners(req, res, next) {
  try {
    return res.json({ items: await listPartnersAdmin(readPagination(req.query) ?? {}) });
  } catch (err) {
    return next(err);
  }
}

export async function adminCreatePartner(req, res, next) {
  try {
    const item = await createPartner(req.body);
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'create', entity: 'partner', entityId: item?.id, detail: { name: req.body.name } });
    return res.status(201).json({ partner: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminUpdatePartner(req, res, next) {
  try {
    const id = parsePositiveId(req.params.id);
    const oldUrls = await findPartnerLogoUrl(id);
    const item = await updatePartner(id, req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Layanan tidak ditemukan'));
    const nextUrls = new Set(item.logo_url ? [item.logo_url] : []);
    const removedUrls = oldUrls.filter((url) => !nextUrls.has(url));
    if (removedUrls.length > 0) {
      await cleanupUnusedMediaList(removedUrls);
    }
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'update', entity: 'partner', entityId: req.params.id, detail: { name: req.body.name } });
    return res.json({ partner: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeletePartner(req, res, next) {
  try {
    const id = parsePositiveId(req.params.id);
    const oldUrls = await findPartnerLogoUrl(id);
    const ok = await deletePartner(id);
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Layanan tidak ditemukan'));
    await cleanupUnusedMediaList(oldUrls);
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'delete', entity: 'partner', entityId: req.params.id, detail: null });
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

function extractStructureImageUrl(rawProfileJson) {
  if (typeof rawProfileJson !== 'string' || !rawProfileJson.trim()) return [];
  try {
    const parsed = JSON.parse(rawProfileJson);
    const urls = new Set();
    if (typeof parsed?.structureImageUrl === 'string' && parsed.structureImageUrl.trim()) {
      urls.add(parsed.structureImageUrl.trim());
    }
    for (const loc of Object.values(parsed?.locales || {})) {
      if (typeof loc?.structureImageUrl === 'string' && loc.structureImageUrl.trim()) {
        urls.add(loc.structureImageUrl.trim());
      }
    }
    return Array.from(urls);
  } catch {
    return [];
  }
}

export async function adminUpdateSettings(req, res, next) {
  try {
    let oldProfileMediaUrls = [];
    if (Object.prototype.hasOwnProperty.call(req.body, 'cms_profile')) {
      const prevSettings = await getSettingsMap();
      oldProfileMediaUrls = extractStructureImageUrl(prevSettings?.cms_profile);
    }
    const settings = await upsertSettings(req.body);
    if (oldProfileMediaUrls.length > 0) {
      const nextUrlSet = new Set(extractStructureImageUrl(settings?.cms_profile));
      const removed = oldProfileMediaUrls.filter((url) => !nextUrlSet.has(url));
      if (removed.length > 0) {
        await cleanupUnusedMediaList(removed);
      }
    }
    await invalidateLandingCache();
    await recordAdminAction(req, { action: 'update', entity: 'site_settings', entityId: null, detail: Object.keys(req.body || {}) });
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
    await recordAdminAction(req, { action: 'upload', entity: 'media', entityId: created?.id, detail: { mimeType: detectedMime } });
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

export async function adminDeleteUploadedImage(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    if (!isValidMediaId(id)) {
      return next(new AppError(400, 'INVALID_ID', 'ID media tidak valid'));
    }
    const deleted = await deleteMediaFileIfUnreferenced(id);
    await recordAdminAction(req, { action: 'delete', entity: 'media', entityId: id, detail: { deleted } });
    return res.json({ deleted });
  } catch (err) {
    return next(err);
  }
}

export async function adminListAuditLog(req, res, next) {
  try {
    const items = await listAdminAuditLog({ limit: req.query?.limit });
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}
