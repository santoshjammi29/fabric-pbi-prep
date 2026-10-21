import useSWRImmutable from 'swr/immutable';

const rawCdn = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_CDN_URL : undefined;
// If the CDN domain is unconfigured/unresolvable or empty, fallback to the edge Worker R2 API
const CDN_BASE =
  (rawCdn && !rawCdn.includes('cdn.lakehousearchitect.com') ? rawCdn.replace(/\/$/, '') : '') ||
  '/api/artifacts';

export function getArtifactUrl(key: string): string {
  const cleanKey = key.replace(/^\//, '');
  return `${CDN_BASE}/${cleanKey}`;
}

export const jsonFetcher = async <T = any>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch artifact: ${url}`);
  return res.json() as Promise<T>;
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
  return jsonFetcher<T[]>(getArtifactUrl(shardMeta.key));
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
