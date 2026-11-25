const store = new Map();
let landingCacheGeneration = 0;

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

export function getLandingCacheGeneration() {
  return landingCacheGeneration;
}

export function invalidateLandingCache() {
  landingCacheGeneration += 1;
  store.delete('landing_bundle');
  for (const key of store.keys()) {
    if (key.startsWith('news_detail_')) {
      store.delete(key);
    }
  }
}
