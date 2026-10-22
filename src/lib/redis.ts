import { Redis } from "@upstash/redis";

/**
 * Distributed Global Cache Layer (Redis / Upstash)
 * Synchronizes user progress, milestone mastery, and active sessions
 * across global edge regions with sub-100ms latency.
 */

// Bounded LRU in-memory fallback store to prevent memory leaks and isolate OOMs
const MAX_FALLBACK_ENTRIES = 500;
const globalMemoryCache = new Map<string, { value: any; expiresAt?: number }>();

function pruneExpiredEntries(): void {
  const now = Date.now();
  for (const [key, item] of globalMemoryCache.entries()) {
    if (item.expiresAt && now > item.expiresAt) {
      globalMemoryCache.delete(key);
    }
  }
}

class FallbackEdgeStore {
  async get<T = any>(key: string): Promise<T | null> {
    const item = globalMemoryCache.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      globalMemoryCache.delete(key);
      return null;
    }
    // Refresh LRU order on hit
    globalMemoryCache.delete(key);
    globalMemoryCache.set(key, item);
    return item.value as T;
  }

  async set(key: string, value: any, options?: { ex?: number }): Promise<"OK"> {
    const expiresAt = options?.ex ? Date.now() + options.ex * 1000 : undefined;

    // Remove existing key to refresh position
    if (globalMemoryCache.has(key)) {
      globalMemoryCache.delete(key);
    }

    // Periodically prune expired entries if nearing capacity
    if (globalMemoryCache.size >= MAX_FALLBACK_ENTRIES) {
      pruneExpiredEntries();
    }

    // Evict oldest entry (LRU) if still at or over capacity
    while (globalMemoryCache.size >= MAX_FALLBACK_ENTRIES) {
      const oldestKey = globalMemoryCache.keys().next().value;
      if (oldestKey !== undefined) {
        globalMemoryCache.delete(oldestKey);
      } else {
        break;
      }
    }

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
