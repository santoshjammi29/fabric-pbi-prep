import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function addApplicationHeaders(request: NextRequest) {
  const response = NextResponse.next();

  const country = request.headers.get("cf-ipcountry") || "US";
  const city = request.headers.get("cf-ipcity") || "Global";
  const region = request.headers.get("cf-region") || request.headers.get("cf-region-code") || "Edge";

  const cfRay = request.headers.get("cf-ray");
  const edgeNode =
    process.env.CF_REGION ||
    (cfRay ? `cf-${cfRay.split("-").pop()?.toLowerCase() || "edge"}` : undefined) ||
    `${country.toLowerCase()}-cloudflare-edge`;

  response.headers.set("x-geo-country", country);
  response.headers.set("x-geo-city", city);
  response.headers.set("x-geo-region", region);
  response.headers.set("x-edge-node", edgeNode);

  const { pathname } = request.nextUrl;
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

  return response;
}

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default clerkConfigured
  ? clerkMiddleware((_auth, request) => addApplicationHeaders(request))
  : addApplicationHeaders;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|diagrams/).*)",
  ],
};
