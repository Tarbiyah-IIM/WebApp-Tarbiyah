import { getCache, setCache } from '../config/cache.js';
import { createSubscriber, getLandingData } from '../models/landing.model.js';

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
