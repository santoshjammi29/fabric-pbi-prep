import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lakehousearchitect.com";

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
      {
        userAgent: "Bingbot",
        allow: "/",
      },
      {
        userAgent: "Applebot",
        allow: "/",
      },
      // Block aggressive / unauthorized AI scrapers
      {
        userAgent: [
          "Bytespider",
          "CCBot",
          "Diffbot",
          "Amazonbot",
          "FacebookBot",
          "ImagesiftBot",
          "Omgilibot",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/feed.xml`,
    ],
    host: BASE_URL,
  };
}
