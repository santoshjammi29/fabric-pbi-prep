/**
 * User Progress & Experience Tier Management
 * Handles localStorage persistence, dynamic mastery calculation, and event broadcasting.
 */

export type ExperienceTier = "beginner" | "associate" | "senior" | "staff_architect";

export interface TierConfig {
  id: ExperienceTier;
  label: string;
  badge: string;
  role: string;
  certs: string[];
  description: string;
  color: {
    badge: string;
    border: string;
    accent: string;
    bg: string;
  };
  recommendedSteps: number[]; // Step numbers 1-6 in RoadmapGrid
  startingPath: {
    title: string;
    href: string;
    module: string;
  };
}

export const EXPERIENCE_TIERS: Record<ExperienceTier, TierConfig> = {
  beginner: {
    id: "beginner",
    label: "Beginner",
    badge: "Tier 1 · Foundations",
    role: "Foundations & BI Architect",
    certs: ["PL-300", "DP-900"],
    description:
      "Master relational fundamentals, Star Schema design, Kimball dimensional modeling, Power BI Direct Lake, and core Lakehouse vs Data Warehouse paradigms.",
    color: {
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      border: "hover:border-emerald-500/40",
      accent: "text-emerald-400",
      bg: "from-emerald-950/20 to-emerald-900/10",
    },
    recommendedSteps: [1, 2],
    startingPath: {
      title: "Key Concepts: Lakehouse vs Data Warehouse",
      href: "/concepts?term=Lakehouse",
      module: "Core Concepts Hub",
    },
  },
  associate: {
    id: "associate",
    label: "Associate",
    badge: "Tier 2 · Core DE",
    role: "Core Data Engineer",
    certs: ["DP-600", "DP-203"],
    description:
      "Build production pipelines with PySpark DataFrame APIs, Medallion Architecture (Bronze/Silver/Gold), Delta Lake ACID transactions, and Data Factory orchestration.",
    color: {
      badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      border: "hover:border-blue-500/40",
      accent: "text-blue-400",
      bg: "from-blue-950/20 to-blue-900/10",
    },
    recommendedSteps: [2, 4],
    startingPath: {
      title: "PySpark Transformations & Medallion Architecture",
      href: "/code-practice?db=pyspark",
      module: "Polyglot Code Hub",
    },
  },
  senior: {
    id: "senior",
    label: "Senior",
    badge: "Tier 3 · Distributed Systems",
    role: "Distributed Systems & Spark Specialist",
    certs: ["Databricks Certified Professional", "Fabric Analytics Engineer"],
    description:
      "Deep dive into Spark 4.0 Catalyst & Tungsten internals, Shuffle Partition tuning, Dynamic Partition Pruning (DPP), Structured Streaming, and dbt semantic modeling.",
    color: {
      badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      border: "hover:border-purple-500/40",
      accent: "text-purple-400",
      bg: "from-purple-950/20 to-purple-900/10",
    },
    recommendedSteps: [3, 5],
    startingPath: {
      title: "Apache Spark Physical Execution & Tungsten Memory",
      href: "/spark-engine#architecture",
      module: "Spark Engine Hub",
    },
  },
  staff_architect: {
    id: "staff_architect",
    label: "Staff Architect",
    badge: "Tier 4 · Principal / Staff",
    role: "Enterprise Architect & FinOps Leader",
    certs: ["Azure Solutions Architect", "Enterprise Data Architect"],
    description:
      "Design mission-critical platforms with 16 Enterprise Architecture Specs, FinOps CU capacity scaling, Cross-cloud Data Mesh, Data Contracts, and Vector RAG pipelines.",
    color: {
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      border: "hover:border-amber-500/40",
      accent: "text-amber-400",
      bg: "from-amber-950/20 to-amber-900/10",
    },
    recommendedSteps: [4, 6],
    startingPath: {
      title: "Multi-Cloud Lakehouse & FinOps CU Architecture",
      href: "/architecture",
      module: "Architecture Hub",
    },
  },
};

const TIER_STORAGE_KEY = "dataprep_experience_tier";
const LAST_TOPIC_STORAGE_KEY = "dataprep_last_topic";
const BOOKMARKS_STORAGE_KEY = "dataprep_bookmarks";
const USERDATA_STORAGE_KEY = "dataprep_userdata";

export function getStoredExperienceTier(): ExperienceTier {
  if (typeof window === "undefined") return "associate";
  try {
    const val = localStorage.getItem(TIER_STORAGE_KEY) as ExperienceTier | null;
    if (val && EXPERIENCE_TIERS[val]) return val;
  } catch {}
  return "associate";
}

export function setStoredExperienceTier(tier: ExperienceTier): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TIER_STORAGE_KEY, tier);
    window.dispatchEvent(new CustomEvent("dataprep:tier-updated", { detail: { tier } }));
  } catch {}
}

export interface LastTopicData {
  title: string;
  href: string;
  category: string;
  progress: number;
}

export function getLastTopic(fallbackTier?: ExperienceTier): LastTopicData {
  const currentTier = fallbackTier || getStoredExperienceTier();
  const defaultStarting = EXPERIENCE_TIERS[currentTier].startingPath;

  if (typeof window === "undefined") {
    return {
      title: defaultStarting.title,
      href: defaultStarting.href,
      category: defaultStarting.module,
      progress: 0,
    };
  }

  try {
    const raw = localStorage.getItem(LAST_TOPIC_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.title && parsed.href) {
        return {
          title: parsed.title,
          href: parsed.href,
          category: parsed.category || "Active Session",
          progress: typeof parsed.progress === "number" ? parsed.progress : 45,
        };
      }
    }
  } catch {}

  return {
    title: defaultStarting.title,
    href: defaultStarting.href,
    category: defaultStarting.module,
    progress: 15,
  };
}

export function recordLastTopic(topic: { title: string; href: string; category?: string; progress?: number }): void {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      ...topic,
      category: topic.category || "Last Visited",
      timestamp: Date.now(),
      progress: topic.progress ?? 50,
    };
    localStorage.setItem(LAST_TOPIC_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("dataprep:topic-updated", { detail: payload }));
  } catch {}
}

export function getMasteryStats(): {
  reviewedCount: number;
  bookmarksCount: number;
  masteryPercentage: number;
  xp: number;
} {
  if (typeof window === "undefined") {
    return { reviewedCount: 0, bookmarksCount: 0, masteryPercentage: 0, xp: 0 };
  }

  try {
    const rawBm = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    const bmList = rawBm ? JSON.parse(rawBm) : [];
    const bookmarksCount = Array.isArray(bmList) ? bmList.length : 0;

    const rawData = localStorage.getItem(USERDATA_STORAGE_KEY);
    const userData = rawData ? JSON.parse(rawData) : null;
    const reviewedCount = (userData && typeof userData.reviewedCount === "number") ? userData.reviewedCount : (bookmarksCount * 3);
    const xp = (userData && typeof userData.xp === "number") ? userData.xp : (reviewedCount * 25 + bookmarksCount * 50);

    // Target benchmark for core milestone mastery: ~120 reviewed items
    const masteryPercentage = Math.min(100, Math.max(5, Math.round((reviewedCount / 120) * 100)));

    return {
      reviewedCount,
      bookmarksCount,
      masteryPercentage,
      xp,
    };
  } catch {
    return { reviewedCount: 0, bookmarksCount: 0, masteryPercentage: 10, xp: 0 };
  }
}
