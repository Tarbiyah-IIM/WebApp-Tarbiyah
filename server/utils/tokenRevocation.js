const revokedBeforeByUser = new Map();

export function markUserAccessTokensRevoked(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) return;
  revokedBeforeByUser.set(id, Math.floor(Date.now() / 1000));
}

export function isAccessTokenRevoked(userId, issuedAtSeconds) {
  const cutoff = revokedBeforeByUser.get(Number(userId));
  if (!cutoff) return false;
  const issuedAt = Number(issuedAtSeconds);
  if (!Number.isFinite(issuedAt)) return true;
  return issuedAt < cutoff;
}

export function clearAccessTokenRevocations() {
  revokedBeforeByUser.clear();
}

export function isCookieTokenString(value) {
  return typeof value === 'string' && value.length > 0;
}
