import useSWRImmutable from 'swr/immutable';
import { openDB, IDBPDatabase } from 'idb';

const rawCdn = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_CDN_URL : undefined;
// If the CDN domain is unconfigured/unresolvable or empty, fallback to the edge Worker R2 API
const CDN_BASE =
  (rawCdn && !rawCdn.includes('cdn.lakehousearchitect.com') ? rawCdn.replace(/\/$/, '') : '') ||
  '/api/artifacts';

export function getArtifactUrl(key: string): string {
  const cleanKey = key.replace(/^\//, '');
  return `${CDN_BASE}/${cleanKey}`;
}

// Memory cache for sub-millisecond tab switching
const memoryCache = new Map<string, any>();

// Browser IndexedDB cache to completely eliminate repeat network requests across page reloads
let idbPromise: Promise<IDBPDatabase<any>> | null = null;

function getArtifactDB(): Promise<IDBPDatabase<any>> | null {
  if (typeof window === 'undefined') return null;
  if (!idbPromise) {
    idbPromise = openDB('lakehouse-artifacts-cache-v1', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('artifacts')) {
          db.createObjectStore('artifacts', { keyPath: 'key' });
        }
      },
    }).catch((err) => {
      console.warn('Could not initialize artifact IndexedDB cache:', err);
      return null as any;
    });
  }
  return idbPromise;
}

export const jsonFetcher = async <T = any>(url: string, cacheKey?: string): Promise<T> => {
  const key = cacheKey || url;

  // 1. In-memory hit (<0.1ms)
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }

  // 2. Persistent IndexedDB hit (<3ms, 0 network bytes)
  const isManifest = url.includes('manifest.json');
  if (!isManifest && typeof window !== 'undefined') {
    try {
      const db = await getArtifactDB();
      if (db) {
        const entry = await db.get('artifacts', key);
        if (entry && entry.data) {
          memoryCache.set(key, entry.data);
          return entry.data as T;
        }
      }
    } catch {
      // Graceful fallback to network
    }
  }

  // 3. Network fetch
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch artifact: ${url}`);
  const data = (await res.json()) as T;

  // Store in memory
  memoryCache.set(key, data);

  // Store in IndexedDB for permanent local zero-egress persistence
  if (!isManifest && typeof window !== 'undefined') {
    try {
      const db = await getArtifactDB();
      if (db) {
        await db.put('artifacts', { key, data, cachedAt: Date.now() });
      }
    } catch {
      // Storage quota / private browsing errors are non-fatal
    }
  }

  return data;
};

export interface ShardManifest {
  version: string;
  generatedAt: string;
  searchIndexKey: string;
  collections: Record<
    string,
    {
      totalItems: number;
      shardSize: number;
      totalShards: number;
      shards: Array<{ index: number; key: string; count: number; hash: string }>;
      byCategory: Record<string, number[]>;
    }
  >;
}

export function useArtifactManifest() {
  return useSWRImmutable<ShardManifest>(
    getArtifactUrl('manifest.json'),
    jsonFetcher<ShardManifest>
  );
}

export function useCollectionShard<T>(collection: string, shardIndex: number) {
  const { data: manifest } = useArtifactManifest();
  const shardMeta = manifest?.collections?.[collection]?.shards?.[shardIndex];
  const url = shardMeta ? getArtifactUrl(shardMeta.key) : null;
  return useSWRImmutable<T[]>(url, (u: string) => jsonFetcher<T[]>(u));
}

export async function fetchArtifactManifest(): Promise<ShardManifest> {
  const url = getArtifactUrl('manifest.json');
  return jsonFetcher<ShardManifest>(url);
}

export async function fetchCollectionShard<T>(collection: string, shardIndex: number): Promise<T[]> {
  const manifest = await fetchArtifactManifest();
  const shardMeta = manifest?.collections?.[collection]?.shards?.[shardIndex];
  if (!shardMeta) throw new Error(`Shard ${shardIndex} not found in collection ${collection}`);
  const cacheKey = `${collection}:${shardIndex}:${shardMeta.hash || shardMeta.key}`;
  return jsonFetcher<T[]>(getArtifactUrl(shardMeta.key), cacheKey);
}

export async function fetchAllCollectionShards<T>(
  collection: string,
  onBatch?: (items: T[]) => void
): Promise<T[]> {
  const manifest = await fetchArtifactManifest();
  const shards = manifest?.collections?.[collection]?.shards || [];
  if (shards.length === 0) return [];

  const allItems: T[] = [];
  const batchSize = 4;

  for (let i = 0; i < shards.length; i += batchSize) {
    const batch = shards.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (shard) => {
        try {
          return await fetchCollectionShard<T>(collection, shard.index);
        } catch (err) {
          console.warn(`Failed to fetch shard ${shard.index} of ${collection}:`, err);
          return [];
        }
      })
    );

    for (const res of results) {
      if (Array.isArray(res)) {
        allItems.push(...res);
        if (onBatch) onBatch(res);
      }
    }
  }

  return allItems;
}
