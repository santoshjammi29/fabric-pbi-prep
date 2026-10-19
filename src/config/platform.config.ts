/**
 * Platform Configuration & Central Source of Truth
 * DataPlatform Architect
 *
 * Centralizes platform metadata, caching policies, CDN parameters,
 * standardized domains, and UI presets to streamline future enhancements.
 */

import { StandardizedDomain, Difficulty } from "@/types";

export const PLATFORM_CONFIG = {
  // Brand & Metadata
  name: "Lakehouse Architect",
  shortName: "Lakehouse",
  tagline: "Enterprise Data Platform & Lakehouse Systems Architecture",
  description:
    "Comprehensive preparation platform for Principal Data Architects and Lead Engineers covering Microsoft Fabric, Databricks, Apache Spark, Delta Lake, Airflow, and Real-Time Lakehouse Systems.",
  url: "https://lakehousearchitect.vercel.app",
  author: "Santosh Jammi",
  githubRepo: "https://github.com/santoshjammi29/fabric-pbi-prep",

  // Edge & Multi-Region Caching Policies (seconds)
  caching: {
    // Incremental Static Regeneration (ISR) interval for static pages
    isrRevalidate: 3600, // 1 hour
    // S-MaxAge for Edge CDN proxy caches
    edgeMaxAge: 3600, // 1 hour
    // Stale-While-Revalidate window for instant edge delivery
    staleWhileRevalidate: 86400, // 24 hours
    // Browser cache for immutable hashed assets
    immutableAssetMaxAge: 31536000, // 1 year
    // Optimized image edge cache TTL
    imageMinCacheTTL: 31536000, // 1 year
  },

  // Pagination & Virtualization Defaults
  pagination: {
    defaultBatchSize: 25,
    pythonRunbookBatchSize: 15,
    qaVirtualizerOverscan: 10,
    conceptVirtualizerOverscan: 8,
  },

  // Hubs Architecture
  hubs: {
    qaPrep: {
      title: "Architecture Interview Q&A Hub",
      path: "/qa-prep",
      badge: "6,500+ Questions",
      description: "Verified interview scenarios with architectural answers, trade-off rubrics, and continuous reading stream.",
    },
    concepts: {
      title: "Core Concepts & Foundations",
      path: "/concepts",
      badge: "290+ Topics",
      description: "Interactive architecture lexicon, engine mechanics, and spaced repetition flashcards.",
    },
    architecture: {
      title: "System Scenarios & Whiteboards",
      path: "/architecture",
      badge: "2,500+ Scenarios",
      description: "Real-world data platform design challenges, 32 whiteboard blueprints, and distributed Python runbooks.",
    },
    guidedLearning: {
      title: "Guided Learning Roadmaps",
      path: "/guided-learning",
      badge: "4-Stage Mastery",
      description: "Structured progressive learning paths from foundational concepts to principal architect level.",
    },
    sparkEngine: {
      title: "Apache Spark Engine Lab",
      path: "/spark-engine",
      badge: "Engine Internals",
      description: "Catalyst optimizer, Tungsten execution, shuffle memory mechanics, and AQE debugging.",
    },
    cheatSheet: {
      title: "Data Engineering Cheatsheets",
      path: "/cheat-sheet",
      badge: "Quick Reference",
      description: "Syntax, patterns, and best practices across PySpark, SQL, Delta Lake, and dbt.",
    },
  },

  // Difficulty Badges & Visual Colors
  difficultySpecs: {
    EASY: {
      label: "Easy",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/10",
      order: 1,
    },
    MEDIUM: {
      label: "Medium",
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
      glow: "shadow-blue-500/10",
      order: 2,
    },
    HARD: {
      label: "Hard",
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      border: "border-orange-500/20",
      glow: "shadow-orange-500/10",
      order: 3,
    },
    ARCHITECT: {
      label: "Architect",
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/20",
      glow: "shadow-purple-500/10",
      order: 4,
    },
  } as Record<Difficulty, { label: string; bg: string; text: string; border: string; glow: string; order: number }>,
} as const;
