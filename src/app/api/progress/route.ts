import { NextResponse } from "next/server";
import { edgeCache } from "@/lib/redis";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "anonymous";
  const cacheKey = `user_progress:${userId}`;

  try {
    const data = await edgeCache.get(cacheKey);

    return NextResponse.json(
      {
        success: true,
        data: data || null,
        edgeRegion: process.env.VERCEL_REGION || "local-edge",
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
    const body = await request.json();
    const userId = body.userId || "anonymous";
    const cacheKey = `user_progress:${userId}`;

    // TTL 30 days (2592000 seconds)
    await edgeCache.set(cacheKey, body.progress, { ex: 2592000 });

    return NextResponse.json(
      {
        success: true,
        syncedAt: new Date().toISOString(),
        edgeRegion: process.env.VERCEL_REGION || "global-edge",
      },
      {
        status: 200,
        headers: {
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
