import { getCache, setCache } from '../config/cache.js';
import { AppError } from '../middlewares/error.middleware.js';
import { createSubscriber, getLandingData, getPublishedNewsById } from '../models/landing.model.js';
import { findMediaFileById } from '../models/media.model.js';

export async function getLanding(_req, res, next) {
  try {
    const cached = getCache('landing_bundle');
    if (cached) {
      return res.json(cached);
    }
    const data = await getLandingData();
    setCache('landing_bundle', data, 60000);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export async function getPublicNewsDetail(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return next(new AppError(404, 'NEWS_NOT_FOUND', 'Berita tidak ditemukan'));
    }
    const news = await getPublishedNewsById(id);
    if (!news) {
      return next(new AppError(404, 'NEWS_NOT_FOUND', 'Berita tidak ditemukan'));
    }
    return res.json({ news });
  } catch (err) {
    return next(err);
  }
}

export async function subscribeNewsletter(req, res, next) {
  try {
    const email = req.body.email.trim().toLowerCase();
    const source = req.body.source || 'footer';
    const result = await createSubscriber({ email, source });
    return res.status(result.alreadySubscribed ? 200 : 201).json({
      message: result.alreadySubscribed
        ? 'Email sudah terdaftar sebagai pelanggan'
        : 'Berhasil berlangganan informasi Fakultas Tarbiyah',
      subscriber: result
    });
  } catch (err) {
    return next(err);
  }
}

export async function getPublicMedia(req, res, next) {
  try {
    const media = await findMediaFileById(req.params.id);
    if (!media) {
      return next(new AppError(404, 'MEDIA_NOT_FOUND', 'Media tidak ditemukan'));
    }
    res.setHeader('Content-Type', media.mime_type);
    res.setHeader('Content-Length', String(media.size_bytes));
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('ETag', `"${media.id}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.send(media.data);
  } catch (err) {
    return next(err);
  }
}
