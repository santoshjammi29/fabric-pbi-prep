import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// Optional bundle analyzer wrapper
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "sonner", "@tanstack/react-virtual"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
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
    ];
  },
  async redirects() {
    return [
      {
        source: "/python",
        destination: "/guided-learning?topic=python",
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
