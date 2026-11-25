const MAX_SAFE_RELAY_TEXT_BYTES = 128 * 1024;
const MAX_CONCURRENT_RELAY = 6;
let activeRelayCount = 0;
const waitingRelayResolvers = [];

export function isSafeHttpUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isSafeHttpsUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isSafeAppUrl(value, { allowEmpty = true, allowHash = false } = {}) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return allowEmpty;
  if (allowHash && trimmed === '#') return true;
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//') && !trimmed.includes('\\');
  }
  return isSafeHttpUrl(trimmed);
}

export function sanitizeSpreadsheetCell(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}

export async function readBoundedResponseText(response, maxBytes = MAX_SAFE_RELAY_TEXT_BYTES) {
  const reader = response.body?.getReader?.();
  if (!reader) {
    const text = await response.text();
    if (Buffer.byteLength(text, 'utf8') > maxBytes) {
      throw new Error('RELAY_RESPONSE_TOO_LARGE');
    }
    return text;
  }

  const decoder = new TextDecoder();
  let totalBytes = 0;
  let result = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel().catch(() => {});
      throw new Error('RELAY_RESPONSE_TOO_LARGE');
    }
    result += decoder.decode(value, { stream: true });
  }
  result += decoder.decode();
  return result;
}

export async function withRelaySlot(fn) {
  if (activeRelayCount >= MAX_CONCURRENT_RELAY) {
    await new Promise((resolve) => waitingRelayResolvers.push(resolve));
  }
  activeRelayCount += 1;
  try {
    return await fn();
  } finally {
    activeRelayCount -= 1;
    const next = waitingRelayResolvers.shift();
    if (next) next();
  }
}

export function normalizeOriginHeader(rawHeader) {
  if (typeof rawHeader !== 'string' || !rawHeader.trim()) return '';
  try {
    return new URL(rawHeader.trim()).origin.toLowerCase();
  } catch {
    return '';
  }
}

export function isTrustedMutationOrigin(req, allowedOrigins = []) {
  const fetchSite = String(req.get('sec-fetch-site') || '').trim().toLowerCase();
  if (fetchSite === 'cross-site') {
    return false;
  }

  const originHeader = normalizeOriginHeader(req.get('origin'));
  const refererOrigin = normalizeOriginHeader(req.get('referer'));
  const candidateOrigin = originHeader || refererOrigin;
  if (!candidateOrigin) {
    return true;
  }

  const normalizedAllowed = new Set(allowedOrigins.map((origin) => origin.toLowerCase()));
  const host = req.get('host');
  if (host) {
    const proto = req.protocol === 'https' ? 'https' : 'http';
    normalizedAllowed.add(`${proto}://${host}`.toLowerCase());
    normalizedAllowed.add(`https://${host}`.toLowerCase());
    normalizedAllowed.add(`http://${host}`.toLowerCase());
  }

  return normalizedAllowed.has(candidateOrigin);
}
