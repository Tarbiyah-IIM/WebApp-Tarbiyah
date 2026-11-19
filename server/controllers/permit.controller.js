import { env } from '../config/env.js';

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
    const response = await fetch(`${scriptUrl}${separator}api=meta`, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(12000)
    });
    const text = await response.text();
    const parsed = tryParseJson(text);

    if (parsed && parsed.ok && parsed.data) {
      return res.json({
        ok: true,
        source: 'apps-script',
        needsAppsScriptDeploy: false,
        data: parsed.data
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
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(req.body),
      redirect: 'follow',
      signal: AbortSignal.timeout(25000)
    });
    const text = await response.text();
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
        code: parsed.code || 'SUBMISSION_ERROR',
        fieldErrors: parsed.fieldErrors || null,
        error: { message: parsed.message || 'Gagal memproses pengajuan surat.' }
      });
    }

    return res.status(201).json(parsed);
  } catch {
    return res.status(502).json({
      ok: false,
      code: 'RELAY_TIMEOUT',
      error: { message: 'Gagal terhubung ke layanan penerbitan surat Google Apps Script. Silakan coba lagi.' }
    });
  }
}
