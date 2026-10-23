import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimitInstance: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (
    !ratelimitInstance &&
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    try {
      ratelimitInstance = new Ratelimit({
        redis: new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        prefix: "rl:api",
      });
    } catch {
      ratelimitInstance = null;
    }
  }
  return ratelimitInstance;
}

async function addApplicationHeaders(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // 1. Edge API Rate Limiting (100 req/min per IP)
  if (pathname.startsWith("/api/")) {
    const rl = getRatelimit();
    if (rl) {
      try {
        const ip =
          request.headers.get("cf-connecting-ip") ||
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          "127.0.0.1";
        const { success, limit, remaining, reset } = await rl.limit(ip);
        if (!success) {
          return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": String(remaining),
              "X-RateLimit-Reset": String(reset),
              "Retry-After": String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))),
            },
          });
        }
      } catch (err) {
        console.warn("[proxy] Rate limit check skipped:", err);
      }
    }
  }

  const country = request.headers.get("cf-ipcountry") || "US";
  const city = request.headers.get("cf-ipcity") || "Global";
  const region = request.headers.get("cf-region") || request.headers.get("cf-region-code") || "Edge";

  const cfRay = request.headers.get("cf-ray");
  const edgeNode =
    process.env.CF_REGION ||
    (cfRay ? `cf-${cfRay.split("-").pop()?.toLowerCase() || "edge"}` : undefined) ||
    `${country.toLowerCase()}-cloudflare-edge`;

  const cspPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://clerk.moderndataengineer.uk https://*.clerk.accounts.dev https://*.clerk.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://moderndataengineer.uk https://www.moderndataengineer.uk https://cdn.lakehousearchitect.com https://img.clerk.com https://challenges.cloudflare.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://challenges.cloudflare.com https://clerk.moderndataengineer.uk https://*.clerk.accounts.dev https://*.clerk.com https://*.upstash.io https://*.upstash.com https://*.supabase.co",
    "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const response = NextResponse.next();

  response.headers.set("x-geo-country", country);
  response.headers.set("x-geo-city", city);
  response.headers.set("x-geo-region", region);
  response.headers.set("x-edge-node", edgeNode);

  if (pathname.startsWith("/api/concepts") || pathname.startsWith("/api/questions")) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400, max-age=60",
    );
    response.headers.set("CDN-Cache-Control", "public, s-maxage=86400");
    response.headers.set("Cloudflare-CDN-Cache-Control", "public, s-maxage=86400");
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  response.headers.set("Content-Security-Policy", cspPolicy);

  return response;
}

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default clerkConfigured
  ? clerkMiddleware(async (_auth, request) => await addApplicationHeaders(request))
  : addApplicationHeaders;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|diagrams/).*)",
  ],
};
