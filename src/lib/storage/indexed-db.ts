import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Sm2CardState {
  id: string;
  interval: number;
  repetition: number;
  efactor: number;
  nextReviewDate: number;
  lastReviewed: number;
}

export interface BookmarkState {
  id: string;
  type: string;
  title: string;
  href: string;
  savedAt: number;
}

interface LakehouseDB extends DBSchema {
  sm2Cards: {
    key: string;
    value: Sm2CardState;
    indexes: { 'by-next-review': number };
  };
  bookmarks: {
    key: string;
    value: BookmarkState;
  };
}

let dbPromise: Promise<IDBPDatabase<LakehouseDB>> | null = null;

export function getClientDB(): Promise<IDBPDatabase<LakehouseDB>> | null {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<LakehouseDB>('lakehouse-architect-db', 1, {
      upgrade(db) {
        const sm2Store = db.createObjectStore('sm2Cards', { keyPath: 'id' });
        sm2Store.createIndex('by-next-review', 'nextReviewDate');
        db.createObjectStore('bookmarks', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export async function updateSm2Card(
  id: string,
  quality: 0 | 1 | 2 | 3 | 4 | 5
): Promise<Sm2CardState | null> {
  const db = await getClientDB();
  if (!db) return null;

  const existing = (await db.get('sm2Cards', id)) ?? {
    id,
    interval: 0,
    repetition: 0,
    efactor: 2.5,
    nextReviewDate: Date.now(),
    lastReviewed: Date.now(),
  };

  let { interval, repetition, efactor } = existing;
  if (quality >= 3) {
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * efactor);
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }
  efactor = Math.max(1.3, efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const updated: Sm2CardState = {
    id,
    interval,
    repetition,
    efactor,
    lastReviewed: Date.now(),
    nextReviewDate: Date.now() + interval * 86400000,
  };
  await db.put('sm2Cards', updated);
  return updated;
}

export async function getSm2Card(id: string): Promise<Sm2CardState | null> {
  const db = await getClientDB();
  if (!db) return null;
  const res = await db.get('sm2Cards', id);
  return res ?? null;
}

export async function getDueSm2Cards(): Promise<Sm2CardState[]> {
  const db = await getClientDB();
  if (!db) return [];
  const now = Date.now();
  const range = IDBKeyRange.upperBound(now);
  return db.getAllFromIndex('sm2Cards', 'by-next-review', range);
}

export async function toggleBookmark(item: {
  id: string;
  type: string;
  title: string;
  href: string;
}): Promise<boolean> {
  const db = await getClientDB();
  if (!db) return false;

  const existing = await db.get('bookmarks', item.id);
  if (existing) {
    await db.delete('bookmarks', item.id);
    return false; // unbookmarked
  } else {
    await db.put('bookmarks', {
      id: item.id,
      type: item.type,
      title: item.title,
      href: item.href,
      savedAt: Date.now(),
    });
    return true; // bookmarked
  }
}

export async function getAllBookmarks(): Promise<BookmarkState[]> {
  const db = await getClientDB();
  if (!db) return [];
  return db.getAll('bookmarks');
}
