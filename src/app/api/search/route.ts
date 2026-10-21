import { NextRequest, NextResponse } from "next/server";
import MiniSearch from "minisearch";
import fs from "node:fs/promises";
import path from "node:path";
import type { SearchCategory, SearchResultItem, TopicIdentification } from "@/lib/search-types";

export const runtime = "nodejs";

type StoredSearchDocument = SearchResultItem & {
  type: string;
  domain?: string;
  topicKey?: string;
  topicLabel?: string;
  topicIcon?: string;
  topicDescription?: string;
  topicExecutiveSummary?: string;
};

type SearchManifest = { searchIndexKey?: string };
type SearchIndex = ReturnType<typeof MiniSearch.loadJSON>;

const INDEX_FIELDS = ["title", "question", "term", "summary", "tags", "domain", "body", "category"];
const STORE_FIELDS = [
  "id", "title", "type", "href", "domain", "difficulty", "category", "page",
  "badge", "snippet", "iconType", "topicKey", "topicLabel", "topicIcon",
  "topicDescription", "topicExecutiveSummary",
];

// Cache the parsed index for the lifetime of a Worker isolate to avoid fetching and
// deserializing a large index on every search request. The index is built at CI time;
// no large content JSON datasets are imported into this request handler.
let cachedIndexPromise: Promise<SearchIndex> | undefined;

async function readArtifactText(key: string): Promise<string> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const context = await getCloudflareContext({ async: true });
    const bucket = (context?.env as any)?.ARTIFACTS_BUCKET as R2Bucket | undefined;
    if (bucket) {
      const object = await bucket.get(key);
      if (object) return await object.text();
    }
  } catch {
    // Local development and unit tests do not always have Cloudflare context.
  }

  const localPath = path.join(process.cwd(), ".build-artifacts", "r2", key);
  return fs.readFile(localPath, "utf8");
}

async function loadSearchIndex(): Promise<SearchIndex> {
  const manifestText = await readArtifactText("manifest.json");
  const manifest = JSON.parse(manifestText) as SearchManifest;
  if (!manifest.searchIndexKey) throw new Error("Search index key is missing from artifact manifest.");
  const serializedIndex = await readArtifactText(manifest.searchIndexKey);
  return MiniSearch.loadJSON(serializedIndex, {
    fields: INDEX_FIELDS,
    storeFields: STORE_FIELDS,
  });
}

function getSearchIndex(): Promise<SearchIndex> {
  if (!cachedIndexPromise) {
    cachedIndexPromise = loadSearchIndex().catch((error) => {
      // Permit recovery if an artifact is temporarily unavailable or a deploy is in progress.
      cachedIndexPromise = undefined;
      throw error;
    });
  }
  return cachedIndexPromise;
}

function emptyResponse() {
  return { query: "", total: 0, identifiedTopics: [] as TopicIdentification[], pageCounts: {} as Record<string, number>, items: [] as SearchResultItem[] };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().slice(0, 160);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 30, 1), 100) : 35;
  const categoryFilter = searchParams.get("category");

  if (!query) {
    return NextResponse.json(emptyResponse(), {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  }

  try {
    const index = await getSearchIndex();
    const results = index.search(query, {
      boost: { title: 4, term: 4, question: 3, tags: 2, category: 1.5 },
      fuzzy: 0.2,
      prefix: true,
    }).map((result: any) => {
      const stored = result as StoredSearchDocument & { score: number };
      return {
        id: stored.id,
        title: stored.title,
        category: stored.category as SearchCategory,
        page: stored.page,
        href: stored.href,
        badge: stored.badge,
        snippet: stored.snippet,
        score: Number(stored.score || 0) + (stored.type === "topic" ? 1000 : 0),
        iconType: stored.iconType,
        type: stored.type,
        topicKey: stored.topicKey,
        topicLabel: stored.topicLabel,
        topicIcon: stored.topicIcon,
        topicDescription: stored.topicDescription,
        topicExecutiveSummary: stored.topicExecutiveSummary,
      };
    });

    results.sort((a: any, b: any) => b.score - a.score);
    const unique = new Map<string, (typeof results)[number]>();
    for (const item of results) if (!unique.has(item.id)) unique.set(item.id, item);
    const allItems = Array.from(unique.values());
    const pageCounts: Record<string, number> = {};
    for (const item of allItems) pageCounts[item.page] = (pageCounts[item.page] || 0) + 1;

    const identifiedTopics: TopicIdentification[] = allItems
      .filter((item: any) => item.type === "topic" && item.topicKey)
      .slice(0, 8)
      .map((item: any) => ({
        key: item.topicKey,
        label: item.topicLabel,
        icon: item.topicIcon,
        domain: item.domain || "",
        href: item.href,
        description: item.topicDescription || "",
        executiveSummary: item.topicExecutiveSummary || "",
      }));

    const filtered = categoryFilter && categoryFilter !== "All"
      ? allItems.filter((item) => item.category.toLowerCase() === categoryFilter.toLowerCase())
      : allItems;

    const response = {
      query,
      total: allItems.length,
      identifiedTopics,
      pageCounts,
      items: filtered.slice(0, limit).map(({ ...item }: any) => {
        delete item.type;
        delete item.topicKey;
        delete item.topicLabel;
        delete item.topicIcon;
        delete item.topicDescription;
        delete item.topicExecutiveSummary;
        return item as SearchResultItem;
      }),
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
    });
  } catch (error) {
    console.error("[search] Unable to load generated search index:", error);
    return NextResponse.json(
      { error: "Search is temporarily unavailable. Please try again shortly." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
