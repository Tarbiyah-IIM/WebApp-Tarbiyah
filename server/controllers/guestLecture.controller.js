import { getCache, setCache } from '../config/cache.js';
import { getSettingsMap } from '../models/landing.model.js';

const DEFAULT_GUEST_LECTURE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwjx4f_R-H4MXwGpjMyI8X-BpGKASOTfkuwqMWp1JkjcvPRYyhiI9C00gMQTp351LHo/exec';

const CACHE_KEY = 'guest_lecture_data';
const CACHE_TTL_MS = 45000;

function tryParseJson(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
}

async function resolveGuestLectureScriptUrl() {
  try {
    const settings = await getSettingsMap();
    const rawContacts = settings?.cms_contacts;
    if (rawContacts && typeof rawContacts === 'string') {
      const parsed = tryParseJson(rawContacts);
      const customUrl = typeof parsed?.guestLectureUrl === 'string' ? parsed.guestLectureUrl.trim() : '';
      if (customUrl.startsWith('https://script.google.com/')) {
        return customUrl;
      }
    }
  } catch {
    return DEFAULT_GUEST_LECTURE_SCRIPT_URL;
  }
  return DEFAULT_GUEST_LECTURE_SCRIPT_URL;
}

function invalidateGuestLectureCache() {
  setCache(CACHE_KEY, null, 0);
}

export async function getGuestLectureData(req, res) {
  const scriptUrl = await resolveGuestLectureScriptUrl();
  const forceRefresh = req.query?.refresh === '1' || req.query?.refresh === 'true';

  if (!forceRefresh) {
    const cached = getCache(CACHE_KEY);
    if (cached && cached.scriptUrl === scriptUrl) {
      return res.json(cached);
    }
  }

  try {
    const separator = scriptUrl.includes('?') ? '&' : '?';
    const response = await fetch(`${scriptUrl}${separator}api=data`, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(15000)
    });
    const text = await response.text();
    const parsed = tryParseJson(text);

    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.trackingLectures)) {
      return res.json({
        ok: false,
        needsAppsScriptDeploy: true,
        scriptUrl,
        data: null
      });
    }

    if (!parsed.success) {
      return res.status(502).json({
        ok: false,
        code: 'APPS_SCRIPT_ERROR',
        scriptUrl,
        error: { message: parsed.message || 'Gagal memuat data kuliah tamu dari Google Sheets.' }
      });
    }

    const payload = {
      ok: true,
      needsAppsScriptDeploy: false,
      scriptUrl,
      syncedAt: new Date().toISOString(),
      data: {
        prodiList: Array.isArray(parsed.prodiList) && parsed.prodiList.length ? parsed.prodiList : ['PAI', 'PIAUD', 'PGMI'],
        dosenList: Array.isArray(parsed.dosenList) ? parsed.dosenList : [],
        incompleteLectures: Array.isArray(parsed.incompleteLectures) ? parsed.incompleteLectures : [],
        trackingLectures: parsed.trackingLectures
      }
    };

    setCache(CACHE_KEY, payload, CACHE_TTL_MS);
    return res.json(payload);
  } catch {
    return res.status(502).json({
      ok: false,
      code: 'RELAY_TIMEOUT',
      scriptUrl,
      error: { message: 'Gagal terhubung ke layanan Google Sheets Kuliah Tamu. Silakan coba lagi.' }
    });
  }
}

export async function submitGuestLecture(req, res) {
  const scriptUrl = await resolveGuestLectureScriptUrl();

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(req.body),
      redirect: 'follow',
      signal: AbortSignal.timeout(30000)
    });
    const text = await response.text();
    const parsed = tryParseJson(text);

    if (!parsed || typeof parsed !== 'object' || typeof parsed.success !== 'boolean') {
      return res.status(503).json({
        ok: false,
        code: 'APPS_SCRIPT_NOT_DEPLOYED',
        scriptUrl,
        error: {
          message:
            'Endpoint JSON Apps Script Kuliah Tamu belum aktif. Silakan deploy versi terbaru Code.js di Google Apps Script.'
        }
      });
    }

    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        code: 'SUBMISSION_ERROR',
        error: { message: parsed.message || 'Gagal menyimpan data kuliah tamu.' }
      });
    }

    invalidateGuestLectureCache();
    const statusCode = req.body.mode === 'update' ? 200 : 201;
    return res.status(statusCode).json({
      ok: true,
      isComplete: Boolean(parsed.isComplete),
      status: parsed.status || 'Not Started',
      message: parsed.message || 'Data kuliah tamu berhasil disimpan.',
      rowIndex: parsed.rowIndex || null,
      fotoUrl: parsed.fotoUrl || ''
    });
  } catch {
    return res.status(502).json({
      ok: false,
      code: 'RELAY_TIMEOUT',
      scriptUrl,
      error: { message: 'Koneksi ke Google Sheets terputus saat menyimpan agenda. Silakan coba lagi.' }
    });
  }
}
