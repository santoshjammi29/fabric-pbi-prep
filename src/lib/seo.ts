import type { Metadata } from "next";

const SITE_URL = "https://fabric-pbi-prep.vercel.app";
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
  const fullTitle = `${title} | Microsoft Data Platform Architect Prep`;

  return {
    title: fullTitle,
    description,
    keywords: [
      "Microsoft Fabric",
      "Power BI",
      "Azure Databricks",
      "Delta Lake",
      "Apache Spark",
      "Data Engineering Interview",
      "System Design",
      "Lakehouse Architecture",
      ...keywords,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: "Microsoft Data Platform Architect Prep",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 675,
          alt: title,
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
      creator: "@fabric_pbi_prep",
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
      name: "Microsoft Data Platform Architect Academy",
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

