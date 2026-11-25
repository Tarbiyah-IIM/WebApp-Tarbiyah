import api from './api.js';
import { optimizeImageForUpload } from './imageOptimizer.service.js';

const ALLOWED_PHOTO_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const guestLectureService = {
  async fetchData({ refresh = false } = {}) {
    const { data } = await api.get('/guest-lectures', {
      params: refresh ? { refresh: '1' } : {},
      timeout: 20000
    });
    return data;
  },

  async submitAgenda(payload) {
    const { data } = await api.post('/guest-lectures', payload, {
      timeout: 35000
    });
    return data;
  }
};

export function formatIsoToDmy(isoValue) {
  const match = String(isoValue || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function parseDmyToIso(dmyValue) {
  const match = String(dmyValue || '').trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return '';
  const dd = match[1].padStart(2, '0');
  const mm = match[2].padStart(2, '0');
  return `${match[3]}-${mm}-${dd}`;
}

export function isSafeExternalHttpUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || /[\r\n\t]/.test(rawUrl)) return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function normalizeDocItems(list, fallbackLink, fallbackText, baseLabel, isCertificate = false) {
  const rawItems = Array.isArray(list) && list.length > 0 ? list : [];
  const validLinks = [];
  const seen = new Set();

  for (const item of rawItems) {
    const url = typeof item?.url === 'string' ? item.url.trim() : '';
    if (isSafeExternalHttpUrl(url) && !seen.has(url)) {
      seen.add(url);
      validLinks.push({
        url,
        rawLabel: String(item?.label || '').trim()
      });
    }
  }

  if (validLinks.length === 0 && isSafeExternalHttpUrl(fallbackLink)) {
    validLinks.push({
      url: fallbackLink.trim(),
      rawLabel: String(fallbackText || '').trim()
    });
  }

  if (validLinks.length > 0) {
    return {
      kind: 'links',
      items: validLinks.map((entry, idx) => ({
        url: entry.url,
        label:
          validLinks.length === 1
            ? baseLabel
            : isCertificate
              ? `${baseLabel} P${idx + 1}`
              : `${baseLabel} ${idx + 1}`,
        tooltip: entry.rawLabel && !isSafeExternalHttpUrl(entry.rawLabel) ? entry.rawLabel : baseLabel
      }))
    };
  }

  const textNote = String(fallbackText || rawItems[0]?.label || '').trim();
  if (textNote) {
    return {
      kind: 'note',
      text: textNote
    };
  }

  return {
    kind: 'empty'
  };
}

const DEFAULT_PHOTO_MESSAGES = {
  readFailed: 'Gagal membaca berkas gambar.',
  invalidFile: 'Berkas gambar tidak valid.',
  unsupportedType: 'Hanya gambar JPG, PNG, WebP, atau GIF yang didukung.',
  gifTooLarge: 'Ukuran file GIF maksimal 1,5 MB. Silakan gunakan JPG, PNG, atau WebP.',
  tooLarge: 'Ukuran gambar melebihi batas maksimal 1,6 MB setelah optimasi.',
  convertFailed: 'Gagal mengonversi gambar.'
};

function readFileAsDataUrl(file, messages = DEFAULT_PHOTO_MESSAGES) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(messages.readFailed));
    reader.readAsDataURL(file);
  });
}

export async function prepareGuestLecturePhoto(file, overrides = {}) {
  const messages = { ...DEFAULT_PHOTO_MESSAGES, ...overrides };
  if (!file || typeof file !== 'object') {
    throw new Error(messages.invalidFile);
  }
  const optimized = await optimizeImageForUpload(file, {
    maxDimension: 1280,
    targetBytes: 280 * 1024,
    skipBytes: 120 * 1024
  });
  const mimeType = String(optimized.type || file.type || 'image/jpeg').toLowerCase();
  if (!ALLOWED_PHOTO_MIMES.has(mimeType)) {
    throw new Error(messages.unsupportedType);
  }
  const effectiveSize = optimized.size || file.size || 0;
  if (mimeType === 'image/gif' && effectiveSize > 1500 * 1024) {
    throw new Error(messages.gifTooLarge);
  }
  if (effectiveSize > 1600 * 1024) {
    throw new Error(messages.tooLarge);
  }
  const dataUrl = await readFileAsDataUrl(optimized, messages);
  const commaIndex = dataUrl.indexOf(',');
  const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : '';
  if (!base64) {
    throw new Error(messages.convertFailed);
  }
  return {
    filename: optimized.name || file.name || 'narasumber.webp',
    mimeType,
    base64,
    previewUrl: dataUrl,
    sizeBytes: optimized.size || file.size || 0
  };
}
