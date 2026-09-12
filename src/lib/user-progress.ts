/**
 * User Progress & Experience Tier Management
 * Handles localStorage persistence, dynamic mastery calculation, and Zustand synchronization.
 */

import {
  ExperienceTier,
  TierConfig,
  EXPERIENCE_TIERS,
  LastTopicData,
} from "@/types/progress";
import { useUserStore } from "@/store/useUserStore";

export type { ExperienceTier, TierConfig, LastTopicData };
export { EXPERIENCE_TIERS };

const TIER_STORAGE_KEY = "dataprep_experience_tier";
const LAST_TOPIC_STORAGE_KEY = "dataprep_last_topic";
const BOOKMARKS_STORAGE_KEY = "dataprep_bookmarks";
const USERDATA_STORAGE_KEY = "dataprep_userdata";

export function getStoredExperienceTier(): ExperienceTier {
  if (typeof window === "undefined") return "associate";
  try {
    const val = localStorage.getItem(TIER_STORAGE_KEY) as ExperienceTier | null;
    if (val && EXPERIENCE_TIERS[val]) return val;
    const storeTier = useUserStore.getState().experienceTier;
    if (storeTier && EXPERIENCE_TIERS[storeTier]) return storeTier;
  } catch {}
  return "associate";
}

export function setStoredExperienceTier(tier: ExperienceTier): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TIER_STORAGE_KEY, tier);
    useUserStore.getState().setExperienceTier(tier);
  } catch {}
}

export function getLastTopic(fallbackTier?: ExperienceTier): LastTopicData {
  const currentTier = fallbackTier || getStoredExperienceTier();
  const defaultStarting = EXPERIENCE_TIERS[currentTier]?.startingPath || EXPERIENCE_TIERS.associate.startingPath;

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
    useUserStore.getState().recordLastTopic(topic);
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
    let bmList: string[] = [];
    if (rawBm) {
      try {
        const parsed = JSON.parse(rawBm);
        if (Array.isArray(parsed)) bmList = parsed;
      } catch {}
    }
    const bookmarksCount = bmList.length;

    const rawData = localStorage.getItem(USERDATA_STORAGE_KEY);
    let userData: any = null;
    if (rawData) {
      try {
        userData = JSON.parse(rawData);
      } catch {}
    }

    const storeUserData = useUserStore.getState().userData;
    const reviewedCount =
      userData && typeof userData.reviewedCount === "number"
        ? userData.reviewedCount
        : storeUserData.reviewedCount || bookmarksCount * 3;

    const xp =
      userData && typeof userData.xp === "number"
        ? userData.xp
        : storeUserData.xp || (reviewedCount * 25 + bookmarksCount * 50);

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
