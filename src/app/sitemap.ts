import { MetadataRoute } from "next";
import { architectureDiagrams } from "@/data/diagrams";
import { GUIDED_TOPICS } from "@/data/guided-learning-topics";
import { conceptsDb } from "@/data";

const BASE_URL = "https://fabric-pbi-prep.vercel.app";

/**
 * Dynamic Self-Updating Sitemap Engine
 * Automatically expands as new questions, concepts, whiteboards,
 * and guided learning tracks are published.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 1. Primary Hub Routes
  const primaryRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/qa-prep`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/concepts`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/mindmap`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/architecture`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/guided-learning`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/cheat-sheet`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/dataops`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/spark-engine`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/modern-stack`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/learning-paths`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/code-practice`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/company-research`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // 2. Guided Learning Subtracks
  const topicRoutes: MetadataRoute.Sitemap = Object.keys(GUIDED_TOPICS).map((topicKey) => ({
    url: `${BASE_URL}/guided-learning?topic=${topicKey}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. High-Resolution Architecture Diagrams
  const diagramRoutes: MetadataRoute.Sitemap = architectureDiagrams.map((diag) => ({
    url: `${BASE_URL}/architecture?tab=diagrams&diagram=${diag.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  // 4. Sample Core Concepts
  const coreConceptRoutes: MetadataRoute.Sitemap = conceptsDb.slice(0, 100).map((concept) => ({
    url: `${BASE_URL}/concepts?tab=concepts&term=${encodeURIComponent(concept.term)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...primaryRoutes, ...topicRoutes, ...diagramRoutes, ...coreConceptRoutes];
}
