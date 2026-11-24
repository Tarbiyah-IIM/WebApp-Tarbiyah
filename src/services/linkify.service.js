const URL_PATTERN = /(https?:\/\/[^\s<>"'`]+|www\.[^\s<>"'`]+)/gi;
const TRAILING_PUNCTUATION = new Set(['.', ',', ';', ':', '!', '?', '"', '\'', '>', ']', '}']);

function countChar(str, target) {
  let count = 0;
  for (let i = 0; i < str.length; i += 1) {
    if (str[i] === target) count += 1;
  }
  return count;
}

function trimTrailingUnbalanced(rawUrl) {
  let cleaned = rawUrl;
  while (cleaned.length > 0) {
    const last = cleaned[cleaned.length - 1];
    if (last === ')') {
      if (countChar(cleaned, ')') > countChar(cleaned, '(')) {
        cleaned = cleaned.slice(0, -1);
        continue;
      }
      break;
    }
    if (TRAILING_PUNCTUATION.has(last)) {
      cleaned = cleaned.slice(0, -1);
      continue;
    }
    break;
  }
  return cleaned;
}

function normalizeSafeHttpUrl(rawUrl) {
  const candidate = /^www\./i.test(rawUrl) ? `https://${rawUrl}` : rawUrl;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

export function tokenizeLinkSegments(text) {
  const input = String(text ?? '');
  if (!input) return [];

  const segments = [];
  let cursor = 0;

  for (const match of input.matchAll(URL_PATTERN)) {
    const matchedRaw = match[0];
    const startIndex = match.index ?? 0;

    if (startIndex > cursor) {
      segments.push({ type: 'text', text: input.slice(cursor, startIndex) });
    }

    const trimmedUrl = trimTrailingUnbalanced(matchedRaw);
    const trailingText = matchedRaw.slice(trimmedUrl.length);
    const safeHref = trimmedUrl ? normalizeSafeHttpUrl(trimmedUrl) : null;

    if (safeHref) {
      segments.push({ type: 'link', text: trimmedUrl, href: safeHref });
      if (trailingText) {
        segments.push({ type: 'text', text: trailingText });
      }
    } else {
      segments.push({ type: 'text', text: matchedRaw });
    }

    cursor = startIndex + matchedRaw.length;
  }

  if (cursor < input.length) {
    segments.push({ type: 'text', text: input.slice(cursor) });
  }

  return segments;
}
