import { getCache, setCache } from '../config/cache.js';
import { env } from '../config/env.js';
import { getSettingsMap } from '../models/landing.model.js';
import { coalesceRelayRead, readBoundedResponseText, withRelaySlot, isSafeHttpsUrl } from '../utils/security.js';

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

function createRelayAbortTracker(res) {
  const clientAbortController = new AbortController();
  const onClose = () => {
    if (!res.writableEnded) {
      clientAbortController.abort();
    }
  };
  res.on('close', onClose);
  return {
    signal: clientAbortController.signal,
    cleanup() {
      res.off('close', onClose);
    }
  };
}

function buildUpstreamSignal(timeoutMs, clientSignal) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  return clientSignal && typeof AbortSignal.any === 'function'
    ? AbortSignal.any([timeoutSignal, clientSignal])
    : timeoutSignal;
}

async function resolveGuestLectureScriptTarget() {
  if (env.hasPrivateGuestLectureUrl) {
    return { scriptUrl: env.guestLectureScriptUrl, isPrivateEnvUrl: true };
  }
  try {
    const settings = await getSettingsMap();
    const rawContacts = settings?.cms_contacts;
    if (rawContacts && typeof rawContacts === 'string') {
      const parsed = tryParseJson(rawContacts);
      const customUrl = typeof parsed?.guestLectureUrl === 'string' ? parsed.guestLectureUrl.trim() : '';
      if (customUrl.startsWith('https://script.google.com/')) {
        return { scriptUrl: customUrl, isPrivateEnvUrl: false };
      }
    }
  } catch {
    return { scriptUrl: env.guestLectureScriptUrl, isPrivateEnvUrl: env.hasPrivateGuestLectureUrl };
  }
  return { scriptUrl: env.guestLectureScriptUrl, isPrivateEnvUrl: env.hasPrivateGuestLectureUrl };
}

function invalidateGuestLectureCache() {
  setCache(CACHE_KEY, null, 0);
  setCache(SOURCE_SCRIPT_CACHE_KEY, null, 0);
}

async function fetchGuestLecturePayload(scriptUrl, clientSignal) {
  const separator = scriptUrl.includes('?') ? '&' : '?';
  const requestUrl = `${scriptUrl}${separator}api=data`;
  const text = await coalesceRelayRead(
    requestUrl,
    () =>
      withRelaySlot(
        async () => {
          const response = await fetch(requestUrl, {
            method: 'GET',
            redirect: 'follow',
            signal: buildUpstreamSignal(15000, clientSignal)
          });
          if (!response.ok) {
            throw new Error('UPSTREAM_HTTP_ERROR');
          }
          return readBoundedResponseText(response, MAX_GUEST_RESPONSE_BYTES);
        },
        { signal: clientSignal }
      ),
    { signal: clientSignal }
  );
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
  const { scriptUrl, isPrivateEnvUrl } = await resolveGuestLectureScriptTarget();
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

  const abortTracker = createRelayAbortTracker(res);
  try {
    const parsed = await fetchGuestLecturePayload(scriptUrl, abortTracker.signal);

    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.trackingLectures)) {
      return res.json({
        ok: false,
        needsAppsScriptDeploy: true,
        ...(isPrivateEnvUrl ? {} : { fallbackUrl: scriptUrl }),
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
  } catch (err) {
    if (err?.code === 'RELAY_ABORTED' || res.writableEnded) {
      return undefined;
    }
    if (err?.code === 'RELAY_OVERLOADED') {
      return res.status(503).json({
        ok: false,
        code: 'RELAY_OVERLOADED',
        error: { message: 'Layanan relay kuliah tamu sedang sibuk. Silakan coba lagi sebentar.' }
      });
    }
    return res.status(502).json({
      ok: false,
      code: 'RELAY_TIMEOUT',
      error: { message: 'Gagal terhubung ke layanan Google Sheets Kuliah Tamu. Silakan coba lagi.' }
    });
  } finally {
    abortTracker.cleanup();
  }
}

export async function submitGuestLecture(req, res) {
  const { scriptUrl, isPrivateEnvUrl } = await resolveGuestLectureScriptTarget();
  const abortTracker = createRelayAbortTracker(res);

  try {
    if (req.body.mode === 'update') {
      const latestParsed = await fetchGuestLecturePayload(scriptUrl, abortTracker.signal);
      const editableRows = extractEditableRowSet({
        incompleteLectures: Array.isArray(latestParsed?.incompleteLectures) ? latestParsed.incompleteLectures : [],
        trackingLectures: Array.isArray(latestParsed?.trackingLectures) ? latestParsed.trackingLectures : []
      });
      if (!latestParsed?.success || !editableRows.has(Number(req.body.rowIndex))) {
        return res.status(403).json({
          ok: false,
          code: 'ROW_NOT_EDITABLE',
          error: {
            message: 'Baris kuliah tamu tersebut sudah final atau tidak terbuka untuk pembaruan.'
          }
        });
      }
    }

    const basePayload = req.body.mode === 'new' ? { ...req.body, rowIndex: null } : req.body;
    const outboundPayload =
      env.appsScriptRelaySecret && isPrivateEnvUrl
        ? { ...basePayload, relaySecret: env.appsScriptRelaySecret }
        : basePayload;

    const text = await withRelaySlot(
      async () => {
        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(outboundPayload),
          redirect: 'follow',
          signal: buildUpstreamSignal(30000, abortTracker.signal)
        });
        if (!response.ok) {
          throw new Error('UPSTREAM_HTTP_ERROR');
        }
        return readBoundedResponseText(response, MAX_GUEST_RESPONSE_BYTES);
      },
      { signal: abortTracker.signal }
    );
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
    const safeFotoUrl = isSafeHttpsUrl(parsed.fotoUrl) ? parsed.fotoUrl.trim() : '';
    return res.status(statusCode).json({
      ok: true,
      isComplete: Boolean(parsed.isComplete),
      status: typeof parsed.status === 'string' ? parsed.status : 'Not Started',
      message: typeof parsed.message === 'string' ? parsed.message : 'Data kuliah tamu berhasil disimpan.',
      rowIndex: parsed.rowIndex || null,
      fotoUrl: safeFotoUrl
    });
  } catch (err) {
    if (err?.code === 'RELAY_ABORTED' || res.writableEnded) {
      return undefined;
    }
    if (err?.code === 'RELAY_OVERLOADED') {
      return res.status(503).json({
        ok: false,
        code: 'RELAY_OVERLOADED',
        error: { message: 'Antrean layanan kuliah tamu sedang penuh. Silakan coba lagi sebentar.' }
      });
    }
    return res.status(502).json({
      ok: false,
      code: 'RELAY_TIMEOUT',
      error: { message: 'Koneksi ke Google Sheets terputus saat menyimpan agenda. Silakan coba lagi.' }
    });
  } finally {
    abortTracker.cleanup();
  }
}
