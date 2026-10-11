import { MetadataRoute } from "next";

const BASE_URL = "https://fabric-pbi-prep.vercel.app";

/**
 * Dynamic robots.txt generator
 * Auto-synchronizes with domain sitemaps and enforces crawler rules.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/progress"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
