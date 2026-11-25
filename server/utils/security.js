const MAX_SAFE_RELAY_TEXT_BYTES = 128 * 1024;
const MAX_CONCURRENT_RELAY = 6;
const MAX_RELAY_QUEUE = 24;
let activeRelayCount = 0;
const waitingRelayResolvers = [];

export function isSafeHttpUrl(value) {
  if (typeof value !== 'string' || /[\r\n\t]/.test(value)) return false;
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
  if (typeof value !== 'string' || /[\r\n\t]/.test(value)) return false;
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
  if (/[\r\n\t]/.test(trimmed)) return false;
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

export async function withRelaySlot(fn, { signal, waitTimeoutMs = 20000 } = {}) {
  if (signal?.aborted) {
    const abortedErr = new Error('RELAY_ABORTED');
    abortedErr.code = 'RELAY_ABORTED';
    throw abortedErr;
  }
  while (activeRelayCount >= MAX_CONCURRENT_RELAY) {
    if (waitingRelayResolvers.length >= MAX_RELAY_QUEUE) {
      const overloadedErr = new Error('RELAY_OVERLOADED');
      overloadedErr.code = 'RELAY_OVERLOADED';
      throw overloadedErr;
    }
    await new Promise((resolve, reject) => {
      let settled = false;
      let timer = null;
      const cleanup = () => {
        if (timer) clearTimeout(timer);
        if (signal) signal.removeEventListener('abort', onAbort);
      };
      const wake = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };
      const fail = (err) => {
        if (settled) return;
        settled = true;
        cleanup();
        const idx = waitingRelayResolvers.indexOf(wake);
        if (idx !== -1) waitingRelayResolvers.splice(idx, 1);
        reject(err);
      };
      const onAbort = () => {
        const abortedErr = new Error('RELAY_ABORTED');
        abortedErr.code = 'RELAY_ABORTED';
        fail(abortedErr);
      };
      if (Number.isFinite(waitTimeoutMs) && waitTimeoutMs > 0) {
        timer = setTimeout(() => {
          const timeoutErr = new Error('RELAY_OVERLOADED');
          timeoutErr.code = 'RELAY_OVERLOADED';
          fail(timeoutErr);
        }, waitTimeoutMs);
        timer.unref?.();
      }
      if (signal) {
        signal.addEventListener('abort', onAbort, { once: true });
      }
      waitingRelayResolvers.push(wake);
    });
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

export function isTrustedMutationOrigin(req, allowedOrigins = [], { isProduction = false } = {}) {
  const fetchSite = String(req.get('sec-fetch-site') || '').trim().toLowerCase();
  if (fetchSite === 'cross-site') {
    return false;
  }

  const rawOrigin = req.get('origin');
  const originHeader = normalizeOriginHeader(rawOrigin);
  if (rawOrigin !== undefined && !originHeader) {
    return false;
  }
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
    if (!isProduction) {
      normalizedAllowed.add(`http://${host}`.toLowerCase());
    }
  }

  return normalizedAllowed.has(candidateOrigin);
}
