import { getCache, setCache } from '../config/cache.js';
import { env } from '../config/env.js';
import { getSettingsMap } from '../models/landing.model.js';
import { readBoundedResponseText, withRelaySlot } from '../utils/security.js';

const CACHE_KEY = 'guest_lecture_data';
const SOURCE_SCRIPT_CACHE_KEY = 'guest_lecture_source_script';
const CACHE_TTL_MS = 45000;
const FORCE_REFRESH_COOLDOWN_MS = 15000;
const MAX_GUEST_RESPONSE_BYTES = 512 * 1024;
let lastManualRefreshAt = 0;

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
    return env.guestLectureScriptUrl;
  }
  return env.guestLectureScriptUrl;
}

function invalidateGuestLectureCache() {
  setCache(CACHE_KEY, null, 0);
  setCache(SOURCE_SCRIPT_CACHE_KEY, null, 0);
}

async function fetchGuestLecturePayload(scriptUrl) {
  const separator = scriptUrl.includes('?') ? '&' : '?';
  const response = await withRelaySlot(() =>
    fetch(`${scriptUrl}${separator}api=data`, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(15000)
    })
  );
  const text = await readBoundedResponseText(response, MAX_GUEST_RESPONSE_BYTES);
  return tryParseJson(text);
}

function extractEditableRowSet(payloadData) {
  const rows = new Set();
  for (const item of payloadData?.incompleteLectures || []) {
    const num = Number(item?.rowIndex);
    if (Number.isInteger(num) && num > 0) rows.add(num);
  }
  for (const item of payloadData?.trackingLectures || []) {
    const status = String(item?.status || '').trim().toLowerCase();
    if (status === 'in revision' || status === 'revision') {
      const num = Number(item?.rowIndex);
      if (Number.isInteger(num) && num > 0) rows.add(num);
    }
  }
  return rows;
}

export async function getGuestLectureData(req, res) {
  const scriptUrl = await resolveGuestLectureScriptUrl();
  const forceRefresh = req.query?.refresh === '1' || req.query?.refresh === 'true';
  const cached = getCache(CACHE_KEY);
  const cachedScriptUrl = getCache(SOURCE_SCRIPT_CACHE_KEY);
  const sameUpstream = Boolean(cached && cachedScriptUrl === scriptUrl);

  if (!forceRefresh && sameUpstream) {
    return res.json(cached);
  }
  if (forceRefresh && sameUpstream && Date.now() - lastManualRefreshAt < FORCE_REFRESH_COOLDOWN_MS) {
    return res.json(cached);
  }

  try {
    const parsed = await fetchGuestLecturePayload(scriptUrl);

    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.trackingLectures)) {
      return res.json({
        ok: false,
        needsAppsScriptDeploy: true,
        fallbackUrl: scriptUrl,
        data: null
      });
    }

    if (!parsed.success) {
      return res.status(502).json({
        ok: false,
        code: 'APPS_SCRIPT_ERROR',
        error: { message: parsed.message || 'Gagal memuat data kuliah tamu dari Google Sheets.' }
      });
    }

    const payload = {
      ok: true,
      needsAppsScriptDeploy: false,
      syncedAt: new Date().toISOString(),
      data: {
        prodiList: Array.isArray(parsed.prodiList) && parsed.prodiList.length ? parsed.prodiList : ['PAI', 'PIAUD', 'PGMI'],
        dosenList: Array.isArray(parsed.dosenList) ? parsed.dosenList : [],
        incompleteLectures: Array.isArray(parsed.incompleteLectures) ? parsed.incompleteLectures : [],
        trackingLectures: parsed.trackingLectures
      }
    };

    if (forceRefresh) {
      lastManualRefreshAt = Date.now();
    }
    setCache(SOURCE_SCRIPT_CACHE_KEY, scriptUrl, CACHE_TTL_MS);
    setCache(CACHE_KEY, payload, CACHE_TTL_MS);
    return res.json(payload);
  } catch {
    return res.status(502).json({
      ok: false,
      code: 'RELAY_TIMEOUT',
      error: { message: 'Gagal terhubung ke layanan Google Sheets Kuliah Tamu. Silakan coba lagi.' }
    });
  }
}

export async function submitGuestLecture(req, res) {
  const scriptUrl = await resolveGuestLectureScriptUrl();

  try {
    if (req.body.mode === 'update') {
      let cached = getCache(CACHE_KEY);
      if (!cached?.data || getCache(SOURCE_SCRIPT_CACHE_KEY) !== scriptUrl) {
        const latestParsed = await fetchGuestLecturePayload(scriptUrl);
        if (latestParsed?.success && Array.isArray(latestParsed.trackingLectures)) {
          cached = {
            data: {
              incompleteLectures: Array.isArray(latestParsed.incompleteLectures) ? latestParsed.incompleteLectures : [],
              trackingLectures: latestParsed.trackingLectures
            }
          };
        }
      }
      const editableRows = extractEditableRowSet(cached?.data);
      if (!editableRows.has(Number(req.body.rowIndex))) {
        return res.status(403).json({
          ok: false,
          code: 'ROW_NOT_EDITABLE',
          error: {
            message: 'Baris kuliah tamu tersebut sudah final atau tidak terbuka untuk pembaruan.'
          }
        });
      }
    }

    const outboundPayload = env.appsScriptRelaySecret
      ? { ...req.body, relaySecret: env.appsScriptRelaySecret }
      : req.body;

    const response = await withRelaySlot(() =>
      fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(outboundPayload),
        redirect: 'follow',
        signal: AbortSignal.timeout(30000)
      })
    );
    const text = await readBoundedResponseText(response, MAX_GUEST_RESPONSE_BYTES);
    const parsed = tryParseJson(text);

    if (!parsed || typeof parsed !== 'object' || typeof parsed.success !== 'boolean') {
      return res.status(503).json({
        ok: false,
        code: 'APPS_SCRIPT_NOT_DEPLOYED',
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
      status: typeof parsed.status === 'string' ? parsed.status : 'Not Started',
      message: typeof parsed.message === 'string' ? parsed.message : 'Data kuliah tamu berhasil disimpan.',
      rowIndex: parsed.rowIndex || null,
      fotoUrl: typeof parsed.fotoUrl === 'string' ? parsed.fotoUrl : ''
    });
  } catch {
    return res.status(502).json({
      ok: false,
      code: 'RELAY_TIMEOUT',
      error: { message: 'Koneksi ke Google Sheets terputus saat menyimpan agenda. Silakan coba lagi.' }
    });
  }
}
