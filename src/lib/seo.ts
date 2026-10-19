import type { Metadata } from "next";

const SITE_URL = "https://lakehousearchitect.vercel.app";
const DEFAULT_OG_IMAGE = `${SITE_URL}/diagrams/fabric_onelake_architecture.webp`;

export interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  keywords?: string[];
  type?: "website" | "article";
}

/**
 * Enterprise recursive metadata builder
 * Generates OpenGraph, Twitter Cards, canonical links, and search robot directives.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  keywords = [],
  type = "website",
}: PageMetadataOptions): Metadata {
  const canonicalUrl = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  
  // Clean raw title so Next.js root layout template ("%s | Lakehouse Architect") does not duplicate the suffix
  const cleanTitle = title
    .replace(/\s*\|\s*Lakehouse Architect.*$/i, "")
    .replace(/\s*\|\s*Fabric Prep.*$/i, "")
    .trim();
  const fullTitle = `${cleanTitle} | Lakehouse Architect`;

  return {
    title: cleanTitle,
    description,
    keywords: [
      "Lakehouse",
      "Lakehouse Architecture",
      "Lakehouse Architect",
      "Data Lakehouse",
      "Medallion Architecture",
      "Delta Lake",
      "Apache Iceberg",
      "Microsoft Fabric",
      "Power BI",
      "Azure Databricks",
      "Apache Spark",
      "Data Engineering Interview",
      "System Design",
      ...keywords,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: "Lakehouse Architect",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 675,
          alt: cleanTitle,
        },
      ],
      locale: "en_US",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      creator: "@lakehouse_arch",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const generatePageMetadata = buildPageMetadata;

/**
 * JSON-LD Course Schema Generator
 */
export function generateCourseSchema(
  courseOrName:
    | {
        name: string;
        description: string;
        url: string;
        skillLevel?: string;
      }
    | string,
  maybeDescription?: string,
  maybeUrl: string = "/"
) {
  const course =
    typeof courseOrName === "string"
      ? {
          name: courseOrName,
          description: maybeDescription || courseOrName,
          url: maybeUrl,
        }
      : courseOrName;

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: "Lakehouse Architect",
      sameAs: SITE_URL,
    },
    url: `${SITE_URL}${course.url.startsWith("/") ? course.url : `/${course.url}`}`,
    educationalLevel: "Advanced / Staff / Principal Architect",
    inLanguage: "en-US",
  };
}

/**
 * JSON-LD FAQPage Schema Generator
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.replace(/<[^>]*>?/gm, "").substring(0, 1000),
      },
    })),
  };
}

/**
 * JSON-LD HowTo Schema Generator
 */
export function generateHowToSchema(
  howtoOrName:
    | {
        name: string;
        description: string;
        steps: { name: string; text: string }[];
      }
    | string,
  maybeDescription?: string,
  maybeSteps?: { name: string; text: string }[]
) {
  const howto =
    typeof howtoOrName === "string"
      ? {
          name: howtoOrName,
          description: maybeDescription || howtoOrName,
          steps: maybeSteps || [],
        }
      : howtoOrName;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howto.name,
    description: howto.description,
    step: (howto.steps || []).map((s, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/**
 * JSON-LD BreadcrumbList Schema Generator for Google Rich Results
 */
export function generateBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

/**
 * JSON-LD TechArticle Schema Generator for Whitepaper / Blueprint deep dives
 */
export function generateTechArticleSchema(options: {
  title: string;
  description: string;
  path: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: options.title,
    description: options.description,
    url: `${SITE_URL}${options.path.startsWith("/") ? options.path : `/${options.path}`}`,
    image: options.image || DEFAULT_OG_IMAGE,
    datePublished: options.datePublished || "2026-01-01T00:00:00Z",
    dateModified: options.dateModified || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: "Santosh Jammi",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Lakehouse Architect",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-512.png`,
      },
    },
    keywords: (options.keywords || []).join(", "),
    inLanguage: "en-US",
  };
}

