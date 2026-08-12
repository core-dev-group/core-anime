// Mock Redis untuk local development tanpa Docker
class MockRedis {
  private data = new Map<string, any>();
  async get(key: string) { return this.data.get(key) || null; }
  async setex(key: string, ttl: number, value: string) { this.data.set(key, value); }
  async incr(key: string) { 
    const val = parseInt(this.data.get(key) || '0', 10) + 1;
    this.data.set(key, val.toString());
    return val;
  }
  async expire(key: string, ttl: number) { /* mock expire */ }
  async set(key: string, value: string) { this.data.set(key, value); }
  async del(key: string) { this.data.delete(key); }
}

export const redis = new MockRedis() as any;

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Redis Get Error [${key}]:`, error);
    return null;
  }
}

export async function setCachedData(key: string, data: any, ttlSeconds: number = 3600) {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    console.error(`Redis Set Error [${key}]:`, error);
  }
}

export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  // Simple fixed window rate limit
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  return current <= limit;
}

export async function isProviderHealthy(name: string): Promise<boolean> {
  // Selalu anggap kuramanime error (sesuai instruksi)
  if (name === 'kuramanime') return false; 
  
  const status = await redis.get(`health:status:${name}`);
  return status !== "unhealthy";
}
