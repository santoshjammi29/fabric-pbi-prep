import { NextResponse } from "next/server";
import { edgeCache } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

export const runtime = "nodejs";

const progressSchema = z.object({
  userId: z.string().min(3).max(128),
  progress: z.record(z.string(), z.any()),
}).strict();

interface StoredProgressRecord {
  ownerTokenHash?: string;
  clerkUserId?: string;
  data: any;
  updatedAt: string;
}

// Compute deterministic SHA-256 hash for token verification
async function hashSecretToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`salt_dataprep_progress_${token}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const customToken = request.headers.get("x-progress-token");
  if (customToken) {
    return customToken.trim();
  }
  return null;
}

async function getClerkUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedUserId = searchParams.get("userId");

  if (!requestedUserId || requestedUserId.trim().length < 3) {
    return NextResponse.json(
      { success: false, error: "Valid userId parameter is required." },
      { status: 400 }
    );
  }

  const clerkUserId = await getClerkUserId();
  const bearerToken = extractBearerToken(request);

  // If user is authenticated via Clerk, allow direct access to their own data
  const isClerkOwner = clerkUserId && clerkUserId === requestedUserId;

  if (!isClerkOwner && !bearerToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Missing authorization credentials." },
      { status: 401 }
    );
  }

  const cacheKey = `user_progress:${requestedUserId}`;

  try {
    const rawRecord = await edgeCache.get(cacheKey);

    if (!rawRecord) {
      return NextResponse.json(
        {
          success: true,
          data: null,
          edgeRegion: request.headers.get("cf-ray")?.split("-").pop() || process.env.CF_REGION || "edge",
        },
        {
          headers: {
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
            "X-Edge-Sync-Latency": "<100ms",
          },
        }
      );
    }

    // Enforce strict ownership verification on all stored records
    const isObjectRecord = typeof rawRecord === "object" && rawRecord !== null;
    const hasValidOwnership =
      isObjectRecord &&
      "data" in (rawRecord as Record<string, any>) &&
      Boolean(
        (rawRecord as Record<string, any>).ownerTokenHash ||
        (rawRecord as Record<string, any>).clerkUserId
      );

    // If an unverified legacy record exists in cache without ownership bounds,
    // deny unauthenticated read access completely to prevent bypass vulnerabilities.
    if (!hasValidOwnership) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Unverified progress record requires owner authentication update.",
        },
        { status: 403 }
      );
    }

    const record = rawRecord as StoredProgressRecord;

    // Verify ownership
    if (record.clerkUserId && record.clerkUserId !== clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not own this progress record." },
        { status: 403 }
      );
    }

    if (record.ownerTokenHash) {
      if (!bearerToken) {
        return NextResponse.json(
          { success: false, error: "Forbidden: Missing progress authorization token." },
          { status: 403 }
        );
      }
      const providedHash = await hashSecretToken(bearerToken);
      if (providedHash !== record.ownerTokenHash) {
        return NextResponse.json(
          { success: false, error: "Forbidden: Invalid authorization token for this userId." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: record.data || null,
        edgeRegion: request.headers.get("cf-ray")?.split("-").pop() || process.env.CF_REGION || "edge",
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          "X-Edge-Sync-Latency": "<100ms",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parseResult = progressSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload schema.", issues: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { userId: requestedUserId, progress } = parseResult.data;
    const clerkUserId = await getClerkUserId();
    const bearerToken = extractBearerToken(request);

    // If signed into Clerk, target user ID defaults to Clerk user ID
    const effectiveUserId = clerkUserId || requestedUserId;
    const isClerkAuth = Boolean(clerkUserId);

    if (!isClerkAuth && !bearerToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing authorization credentials." },
        { status: 401 }
      );
    }

    const cacheKey = `user_progress:${effectiveUserId}`;
    const existingRaw = await edgeCache.get(cacheKey);

    let tokenHashToStore: string | undefined;
    if (bearerToken) {
      tokenHashToStore = await hashSecretToken(bearerToken);
    }

    if (existingRaw && typeof existingRaw === "object") {
      const existing = existingRaw as StoredProgressRecord;
      if (existing.clerkUserId && existing.clerkUserId !== clerkUserId) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You do not own this progress record." },
          { status: 403 }
        );
      }
      if (existing.ownerTokenHash && tokenHashToStore && existing.ownerTokenHash !== tokenHashToStore) {
        return NextResponse.json(
          { success: false, error: "Forbidden: Invalid authorization token for this userId." },
          { status: 403 }
        );
      }
    }

    const recordToStore: StoredProgressRecord = {
      ...(clerkUserId ? { clerkUserId } : {}),
      ...(tokenHashToStore ? { ownerTokenHash: tokenHashToStore } : {}),
      data: progress,
      updatedAt: new Date().toISOString(),
    };

    // TTL 30 days (2592000 seconds)
    await edgeCache.set(cacheKey, recordToStore, { ex: 2592000 });

    return NextResponse.json(
      {
        success: true,
        syncedAt: recordToStore.updatedAt,
        userId: effectiveUserId,
        edgeRegion: request.headers.get("cf-ray")?.split("-").pop() || process.env.CF_REGION || "edge",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          "X-Edge-Sync-Latency": "<100ms",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
