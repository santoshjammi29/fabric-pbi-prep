import { Redis } from "@upstash/redis";

/**
 * Distributed Global Cache Layer (Redis / Upstash)
 * Synchronizes user progress, milestone mastery, and active sessions
 * across global edge regions with sub-100ms latency.
 */

// In-memory fallback map for environments without remote Upstash credentials
const globalMemoryCache = new Map<string, { value: any; expiresAt?: number }>();

class FallbackEdgeStore {
  async get<T = any>(key: string): Promise<T | null> {
    const item = globalMemoryCache.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      globalMemoryCache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set(key: string, value: any, options?: { ex?: number }): Promise<"OK"> {
    const expiresAt = options?.ex ? Date.now() + options.ex * 1000 : undefined;
    globalMemoryCache.set(key, { value, expiresAt });
    return "OK";
  }

  async del(key: string): Promise<number> {
    return globalMemoryCache.delete(key) ? 1 : 0;
  }
}

export function getEdgeCache(): Redis | FallbackEdgeStore {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      return new Redis({
        url,
        token,
      });
    } catch (err) {
      console.warn("Failed to initialize Upstash Redis, falling back to Edge In-Memory Store:", err);
      return new FallbackEdgeStore();
    }
  }

  return new FallbackEdgeStore();
}

export const edgeCache = getEdgeCache();
