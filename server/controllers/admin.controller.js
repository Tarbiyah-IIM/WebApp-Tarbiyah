import { invalidateLandingCache } from '../config/cache.js';
import { AppError } from '../middlewares/error.middleware.js';
import {
  createFaq,
  createFeature,
  createPartner,
  createStat,
  createTestimonial,
  deleteFaq,
  deleteFeature,
  deletePartner,
  deleteStat,
  deleteTestimonial,
  getPortalOverviewStats,
  getSettingsMap,
  listFaqsAdmin,
  listFeaturesAdmin,
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

export async function adminUpdateTestimonial(req, res, next) {
  try {
    const item = await updateTestimonial(Number(req.params.id), req.body);
    if (!item) return next(new AppError(404, 'NOT_FOUND', 'Berita tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ testimonial: item });
  } catch (err) {
    return next(err);
  }
}

export async function adminDeleteTestimonial(req, res, next) {
  try {
    const ok = await deleteTestimonial(Number(req.params.id));
    if (!ok) return next(new AppError(404, 'NOT_FOUND', 'Berita tidak ditemukan'));
    invalidateLandingCache();
    return res.json({ message: 'Berita dihapus' });
  } catch (err) {
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

export function adminUploadImage(req, res, next) {
  if (!req.file) {
    return next(new AppError(400, 'NO_FILE', 'File gambar tidak ditemukan'));
  }
  return res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename
  });
}
