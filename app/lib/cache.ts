// ==========================================
// 1. Sanka API In-Memory Cache 
// ==========================================
const MEMORY_CACHE = new Map<string, { data: any; expiry: number }>();

export function getMemoryCache<T>(key: string): T | null {
  const cached = MEMORY_CACHE.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiry) {
    MEMORY_CACHE.delete(key);
    return null;
  }
  return cached.data as T;
}

export function setMemoryCache(key: string, data: any, ttlMinutes = 10) {
  MEMORY_CACHE.set(key, {
    data,
    expiry: Date.now() + ttlMinutes * 60 * 1000,
  });
}
