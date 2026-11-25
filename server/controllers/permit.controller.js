import { env } from '../config/env.js';
import { isSafeHttpsUrl, readBoundedResponseText, withRelaySlot } from '../utils/security.js';

const MAX_META_RESPONSE_BYTES = 128 * 1024;
const MAX_SUBMIT_RESPONSE_BYTES = 4 * 1024 * 1024;

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

const FALLBACK_META_TEMPLATE = {
  nama_dekan: 'Lailla Hidayatul Amin, M.Pd.I.',
  nidn_dekan: '2108087903',
  nomor_surat: '637/KEL/FT/IIM/VII/2026',
  system_status: 'OPEN',
  program_studi_options: [
    'Pendidikan Agama Islam',
    'Pendidikan Guru Madrasah Ibtidaiyah',
    'Pendidikan Islam Anak Usia Dini'
  ],
  semester_options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
  limits: {
    kepada: 150,
    nama_mahasiswa: 120,
    nim: 30,
    program_studi: 100,
    tempat_ppl: 150,
    alamat_ppl: 300
  },
  is_configured: true
};

function buildFallbackMeta() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startYear = month >= 6 ? year : year - 1;
  return {
    ...FALLBACK_META_TEMPLATE,
    tahun_akademik: `${startYear}/${startYear + 1}`,
    tanggal_bulan_tahun: `${now.getDate()} ${INDONESIAN_MONTHS[month]} ${year}`
  };
}

function tryParseJson(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
}

function sanitizeWorkPermitMeta(rawData) {
  if (!rawData || typeof rawData !== 'object') return buildFallbackMeta();
  const fallback = buildFallbackMeta();
  return {
    nama_dekan: typeof rawData.nama_dekan === 'string' ? rawData.nama_dekan.slice(0, 120) : fallback.nama_dekan,
    nidn_dekan: typeof rawData.nidn_dekan === 'string' ? rawData.nidn_dekan.slice(0, 40) : fallback.nidn_dekan,
    nomor_surat: typeof rawData.nomor_surat === 'string' ? rawData.nomor_surat.slice(0, 100) : fallback.nomor_surat,
    system_status: rawData.system_status === 'CLOSED' ? 'CLOSED' : 'OPEN',
    program_studi_options: Array.isArray(rawData.program_studi_options)
      ? rawData.program_studi_options.map((v) => String(v)).slice(0, 20)
      : fallback.program_studi_options,
    semester_options: Array.isArray(rawData.semester_options)
      ? rawData.semester_options.map((v) => String(v)).slice(0, 20)
      : fallback.semester_options,
    limits: rawData.limits && typeof rawData.limits === 'object' ? rawData.limits : fallback.limits,
    tahun_akademik:
      typeof rawData.tahun_akademik === 'string' ? rawData.tahun_akademik.slice(0, 40) : fallback.tahun_akademik,
    tanggal_bulan_tahun:
      typeof rawData.tanggal_bulan_tahun === 'string'
        ? rawData.tanggal_bulan_tahun.slice(0, 60)
        : fallback.tanggal_bulan_tahun,
    is_configured: Boolean(rawData.is_configured ?? true)
  };
}

function sanitizeWorkPermitSubmitResponse(parsed) {
  const src = parsed?.data && typeof parsed.data === 'object' ? parsed.data : {};
  const rawDownloadUrl = typeof src.download_url === 'string' ? src.download_url.trim() : '';
  const rawPdfBase64 = typeof src.pdf_base64 === 'string' ? src.pdf_base64.trim() : '';
  const safePdfBase64 = /^[A-Za-z0-9+/=\r\n]+$/.test(rawPdfBase64) ? rawPdfBase64 : '';
  const safeFileName = String(src.file_name || 'Surat_Ijin_Kerja_PPL.pdf').replace(/[\\/:*?"<>|]/g, '_');

  return {
    ok: true,
    message: typeof parsed.message === 'string' ? parsed.message.slice(0, 300) : 'Surat Ijin Kerja berhasil diterbitkan.',
    data: {
      nomor_surat: String(src.nomor_surat || ''),
      nama_mahasiswa: String(src.nama_mahasiswa || ''),
      nim: String(src.nim || ''),
      program_studi: String(src.program_studi || ''),
      semester: String(src.semester || ''),
      tempat_ppl: String(src.tempat_ppl || ''),
      file_name: safeFileName,
      download_url: isSafeHttpsUrl(rawDownloadUrl) ? rawDownloadUrl : '',
      pdf_base64: safePdfBase64
    }
  };
}

export async function getWorkPermitMeta(_req, res) {
  const scriptUrl = env.pplWorkPermitScriptUrl;
  if (!scriptUrl) {
    return res.json({
      ok: true,
      source: 'fallback',
      needsAppsScriptDeploy: true,
      data: buildFallbackMeta()
    });
  }

  try {
    const separator = scriptUrl.includes('?') ? '&' : '?';
    const response = await withRelaySlot(() =>
      fetch(`${scriptUrl}${separator}api=meta`, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(12000)
      })
    );
    const text = await readBoundedResponseText(response, MAX_META_RESPONSE_BYTES);
    const parsed = tryParseJson(text);

    if (parsed && parsed.ok && parsed.data) {
      return res.json({
        ok: true,
        source: 'apps-script',
        needsAppsScriptDeploy: false,
        data: sanitizeWorkPermitMeta(parsed.data)
      });
    }

    return res.json({
      ok: true,
      source: 'fallback',
      needsAppsScriptDeploy: true,
      data: buildFallbackMeta()
    });
  } catch {
    return res.json({
      ok: true,
      source: 'fallback',
      needsAppsScriptDeploy: true,
      data: buildFallbackMeta()
    });
  }
}

export async function submitWorkPermit(req, res) {
  const scriptUrl = env.pplWorkPermitScriptUrl;
  if (!scriptUrl) {
    return res.status(503).json({
      ok: false,
      code: 'SCRIPT_URL_MISSING',
      error: { message: 'URL layanan Google Apps Script belum dikonfigurasi di server.' }
    });
  }

  try {
    const outboundPayload = env.appsScriptRelaySecret
      ? { ...req.body, relaySecret: env.appsScriptRelaySecret }
      : req.body;

    const response = await withRelaySlot(() =>
      fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(outboundPayload),
        redirect: 'follow',
        signal: AbortSignal.timeout(25000)
      })
    );
    const text = await readBoundedResponseText(response, MAX_SUBMIT_RESPONSE_BYTES);
    const parsed = tryParseJson(text);

    if (!parsed) {
      return res.status(503).json({
        ok: false,
        code: 'APPS_SCRIPT_NOT_DEPLOYED',
        error: {
          message:
            'Endpoint JSON Apps Script belum aktif. Silakan deploy versi terbaru Code.gs (yang memiliki fungsi doPost) di Google Apps Script.'
        }
      });
    }

    if (!parsed.ok) {
      const statusCode =
        parsed.code === 'VALIDATION_ERROR' ? 400 : parsed.code === 'SYSTEM_CLOSED' ? 403 : 502;
      return res.status(statusCode).json({
        ok: false,
        code: typeof parsed.code === 'string' ? parsed.code : 'SUBMISSION_ERROR',
        fieldErrors: parsed.fieldErrors && typeof parsed.fieldErrors === 'object' ? parsed.fieldErrors : null,
        error: { message: typeof parsed.message === 'string' ? parsed.message : 'Gagal memproses pengajuan surat.' }
      });
    }

    return res.status(201).json(sanitizeWorkPermitSubmitResponse(parsed));
  } catch {
    return res.status(502).json({
      ok: false,
      code: 'RELAY_TIMEOUT',
      error: { message: 'Gagal terhubung ke layanan penerbitan surat Google Apps Script. Silakan coba lagi.' }
    });
  }
}
