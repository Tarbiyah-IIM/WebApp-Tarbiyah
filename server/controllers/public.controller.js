import { getCache, getLandingCacheGeneration, setCache } from '../config/cache.js';
import { AppError } from '../middlewares/error.middleware.js';
import { createSubscriber, getLandingData, getPublishedNewsById } from '../models/landing.model.js';
import { listVisibleLecturers } from '../models/lecturer.model.js';
import { findMediaFileById } from '../models/media.model.js';

let landingInFlight = null;

export async function getLanding(_req, res, next) {
  try {
    const cached = await getCache('landing_bundle');
    if (cached) {
      return res.json(cached);
    }
    if (!landingInFlight) {
      const startGeneration = getLandingCacheGeneration();
      landingInFlight = getLandingData()
        .then(async (data) => {
          if (getLandingCacheGeneration() === startGeneration) {
            await setCache('landing_bundle', data, 60000);
          }
          return data;
        })
        .finally(() => {
          landingInFlight = null;
        });
    }
    const data = await landingInFlight;
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export async function getPublicNewsDetail(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0 || id > 4294967295) {
      return next(new AppError(404, 'NEWS_NOT_FOUND', 'Berita tidak ditemukan'));
    }
    const cacheKey = `news_detail_${id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ news: cached });
    }
    const news = await getPublishedNewsById(id);
    if (!news) {
      return next(new AppError(404, 'NEWS_NOT_FOUND', 'Berita tidak ditemukan'));
    }
    await setCache(cacheKey, news, 30000);
    return res.json({ news });
  } catch (err) {
    return next(err);
  }
}

export async function getPublicLecturers(req, res, next) {
  try {
    const rawProgram = typeof req.query?.program === 'string' ? req.query.program.trim().toLowerCase() : '';
    const programSlug = rawProgram === 'pai' || rawProgram === 'pgmi' || rawProgram === 'piaud' ? rawProgram : null;
    const cached = await getCache('landing_bundle');
    if (cached && Array.isArray(cached.lecturers)) {
      const items = programSlug
        ? cached.lecturers.filter((item) => item.program_slug === programSlug)
        : cached.lecturers;
      return res.json({ items });
    }
    const items = await listVisibleLecturers(programSlug);
    return res.json({ items });
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
    const etag = `"${media.id}"`;
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('ETag', etag);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const ifNoneMatch = req.headers['if-none-match'];
    if (typeof ifNoneMatch === 'string' && ifNoneMatch.split(',').some((tag) => tag.trim() === etag)) {
      return res.status(304).end();
    }
    res.setHeader('Content-Type', media.mime_type);
    res.setHeader('Content-Length', String(media.size_bytes));
    return res.send(media.data);
  } catch (err) {
    return next(err);
  }
}
