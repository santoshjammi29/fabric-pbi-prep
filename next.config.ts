import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

// Optional bundle analyzer wrapper
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const cspPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.lakehousearchitect.com https://img.clerk.com https://challenges.cloudflare.com",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://*.upstash.io https://*.supabase.co",
  "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "sonner", "@tanstack/react-virtual"],
  },
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.lakehousearchitect.com",
      },
    ],
  },
  outputFileTracingExcludes: {
    "*": [
      "./content/**/*",
      "./scripts/**/*",
      "./.build-artifacts/**/*",
      "./.git/**/*",
      "./node_modules/@swc/core-linux-x64-gnu/**/*",
      "./node_modules/@swc/core-linux-x64-musl/**/*",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: cspPolicy },
        ],
      },
      {
        source: "/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/diagrams/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, stale-while-revalidate=86400, immutable" },
        ],
      },
      {
        source: "/api/artifacts/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=60, s-maxage=120, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/api/artifacts/shards/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/api/artifacts/blueprints/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/api/artifacts/cheat-sheets/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/api/((?!customer-workers|progress).*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/api/customer-workers",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
      {
        source: "/api/progress",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "lakehousearchitect.com",
          },
        ],
        destination: "https://moderndataengineer.uk/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.lakehousearchitect.com",
          },
        ],
        destination: "https://moderndataengineer.uk/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "fabric-pbi-prep.vercel.app",
          },
        ],
        destination: "https://lakehousearchitect.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "lakehouse-architect.vercel.app",
          },
        ],
        destination: "https://lakehousearchitect.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "lakehousearchitect.vercel.app",
          },
        ],
        destination: "https://lakehousearchitect.com/:path*",
        permanent: true,
      },
      {
        source: "/security.txt",
        destination: "/.well-known/security.txt",
        permanent: true,
      },
      {
        source: "/learn",
        destination: "/guided-learning",
        permanent: true,
      },
      {
        source: "/chrome-devtools",
        destination: "/concepts",
        permanent: false,
      },
      {
        source: "/concepts/glossary",
        destination: "/concepts",
        permanent: true,
      },
      {
        source: "/concepts/overview",
        destination: "/concepts",
        permanent: true,
      },
      {
        source: "/concepts/mindmap",
        destination: "/concepts?tab=mindmap",
        permanent: true,
      },
      {
        source: "/concepts/all",
        destination: "/concepts?tab=concepts",
        permanent: true,
      },
      {
        source: "/mindmap",
        destination: "/concepts?tab=mindmap",
        permanent: true,
      },
      {
        source: "/prep",
        destination: "/qa-prep",
        permanent: true,
      },
      {
        source: "/practice",
        destination: "/code-practice",
        permanent: true,
      },
      {
        source: "/blueprints",
        destination: "/architecture?tab=diagrams",
        permanent: true,
      },
      {
        source: "/scenarios",
        destination: "/architecture?tab=scenarios",
        permanent: true,
      },
      {
        source: "/system-design",
        destination: "/architecture?tab=scenarios",
        permanent: true,
      },
      {
        source: "/runbooks",
        destination: "/cheat-sheet",
        permanent: true,
      },
      {
        source: "/lifecycle",
        destination: "/dataops",
        permanent: true,
      },
      {
        source: "/ci-cd",
        destination: "/dataops",
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
