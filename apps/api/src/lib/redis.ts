import Redis from "ioredis";

let redis: Redis | null = null;
let redisAvailable = false;

export function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    redis.on("error", () => {
      redisAvailable = false;
    });
    redis.on("connect", () => {
      redisAvailable = true;
    });
    redis.connect().catch(() => {
      redisAvailable = false;
    });
  }
  return redisAvailable ? redis : redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    if (!client) return null;
    const raw = await client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 60
): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // cache is optional
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;
    const keys = await client.keys(pattern);
    if (keys.length) await client.del(...keys);
  } catch {
    // ignore
  }
}
