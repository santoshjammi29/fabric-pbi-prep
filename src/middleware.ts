import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Global Edge Middleware
 * 1. Geo-IP Routing & Nearest Edge Node Detection
 * 2. Automatic SWR (Stale-While-Revalidate) Cache-Control injection for Edge API Routes
 * 3. Enterprise Security Headers
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Geo-IP & Edge Detection (via Vercel Edge Headers)
  const country = request.headers.get("x-vercel-ip-country") || "US";
  const city = request.headers.get("x-vercel-ip-city") || "Global";
  const region = request.headers.get("x-vercel-ip-country-region") || "Edge";

  response.headers.set("x-geo-country", country);
  response.headers.set("x-geo-city", city);
  response.headers.set("x-geo-region", region);
  response.headers.set(
    "x-edge-node",
    process.env.VERCEL_REGION || `${country.toLowerCase()}-edge-01`
  );

  // 2. Edge Caching & SWR Headers for API Routes
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/concepts") || pathname.startsWith("/api/questions")) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400, max-age=60"
    );
    response.headers.set("CDN-Cache-Control", "public, s-maxage=86400");
    response.headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=86400");
  }

  // 3. Enterprise Security Headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico|diagrams/).*)",
  ],
};
