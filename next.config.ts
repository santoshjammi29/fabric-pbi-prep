import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// Optional bundle analyzer wrapper
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "sonner", "@tanstack/react-virtual"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
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
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/python",
        destination: "/guided-learning?topic=python",
        permanent: true,
      },
      {
        source: "/diagnostic",
        destination: "/learning-paths",
        permanent: true,
      },
      {
        source: "/data-engineering-mindmap",
        destination: "/mindmap",
        permanent: true,
      },
      {
        source: "/de-mindmap",
        destination: "/mindmap",
        permanent: true,
      },
      {
        source: "/cheatsheet",
        destination: "/cheat-sheet",
        permanent: true,
      },
      {
        source: "/practice",
        destination: "/code-practice",
        permanent: true,
      },
      {
        source: "/scenarios",
        destination: "/architecture?tab=scenarios",
        permanent: true,
      },
      {
        source: "/diagrams",
        destination: "/architecture?tab=diagrams",
        permanent: true,
      },
      {
        source: "/questions",
        destination: "/qa-prep",
        permanent: true,
      },
      {
        source: "/spark",
        destination: "/spark-engine",
        permanent: true,
      },
      {
        source: "/gcc",
        destination: "/company-research",
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
