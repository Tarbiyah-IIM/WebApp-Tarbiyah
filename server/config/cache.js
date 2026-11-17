const store = new Map();

export function getCache(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCache(key, value, ttlMs = 60000) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
}

export function invalidateLandingCache() {
  store.delete('landing_bundle');
}
