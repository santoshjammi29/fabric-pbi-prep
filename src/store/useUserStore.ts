import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ExperienceTier, LastTopicData, EXPERIENCE_TIERS } from "@/types/progress";

export interface UserData {
  xp: number;
  reviewedCount: number;
  lastActive: string;
}

export interface UserStoreState {
  experienceTier: ExperienceTier;
  bookmarks: string[];
  lastTopic: LastTopicData;
  userData: UserData;
  decisionLedger: Record<string, string>; // decisionPointId -> optionId
  diagnosticScore: number | null;

  // Actions
  setExperienceTier: (tier: ExperienceTier) => void;
  toggleBookmark: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  setBookmarks: (bookmarks: string[]) => void;
  recordLastTopic: (topic: { title: string; href: string; category?: string; progress?: number }) => void;
  recordReviewedCard: (xpGain?: number) => void;
  recordDecision: (decisionId: string, choiceId: string) => void;
  setDiagnosticScore: (score: number, recommendedTier?: ExperienceTier) => void;
  resetProgress: () => void;
}

const DEFAULT_TIER: ExperienceTier = "associate";

const DEFAULT_STARTING = EXPERIENCE_TIERS[DEFAULT_TIER].startingPath;

const DEFAULT_TOPIC: LastTopicData = {
  title: DEFAULT_STARTING.title,
  href: DEFAULT_STARTING.href,
  category: DEFAULT_STARTING.module,
  progress: 15,
};

// Defensive helper to read legacy localStorage items on initial migration
function getInitialLegacyData(): Partial<UserStoreState> {
  if (typeof window === "undefined") return {};

  try {
    const legacyTier = localStorage.getItem("dataprep_experience_tier") as ExperienceTier | null;
    const legacyBmRaw = localStorage.getItem("dataprep_bookmarks");
    let legacyBookmarks: string[] = [];
    if (legacyBmRaw) {
      try {
        const parsed = JSON.parse(legacyBmRaw);
        if (Array.isArray(parsed)) {
          legacyBookmarks = parsed.filter((x): x is string => typeof x === "string");
        }
      } catch {}
    }

    const legacyTopicRaw = localStorage.getItem("dataprep_last_topic");
    let legacyTopic: LastTopicData | undefined;
    if (legacyTopicRaw) {
      try {
        const parsed = JSON.parse(legacyTopicRaw);
        if (parsed && typeof parsed.title === "string" && typeof parsed.href === "string") {
          legacyTopic = {
            title: parsed.title,
            href: parsed.href,
            category: parsed.category || "Active Session",
            progress: typeof parsed.progress === "number" ? parsed.progress : 45,
          };
        }
      } catch {}
    }

    const legacyUserRaw = localStorage.getItem("dataprep_userdata");
    let legacyUserData: UserData | undefined;
    if (legacyUserRaw) {
      try {
        const parsed = JSON.parse(legacyUserRaw);
        if (parsed && typeof parsed === "object") {
          legacyUserData = {
            xp: typeof parsed.xp === "number" ? parsed.xp : 0,
            reviewedCount: typeof parsed.reviewedCount === "number" ? parsed.reviewedCount : 0,
            lastActive: typeof parsed.lastActive === "string" ? parsed.lastActive : new Date().toISOString(),
          };
        }
      } catch {}
    }

    return {
      ...(legacyTier && EXPERIENCE_TIERS[legacyTier] ? { experienceTier: legacyTier } : {}),
      ...(legacyBookmarks.length > 0 ? { bookmarks: legacyBookmarks } : {}),
      ...(legacyTopic ? { lastTopic: legacyTopic } : {}),
      ...(legacyUserData ? { userData: legacyUserData } : {}),
    };
  } catch {
    return {};
  }
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      experienceTier: DEFAULT_TIER,
      bookmarks: [],
      lastTopic: DEFAULT_TOPIC,
      userData: {
        xp: 650,
        reviewedCount: 42,
        lastActive: new Date().toISOString(),
      },
      decisionLedger: {},
      diagnosticScore: null,

      setExperienceTier: (tier) => {
        const starting = EXPERIENCE_TIERS[tier]?.startingPath;
        set((state) => ({
          experienceTier: tier,
          // Keep legacy storage key in sync for backwards compatibility
          lastTopic:
            state.lastTopic.title === DEFAULT_TOPIC.title && starting
              ? {
                  title: starting.title,
                  href: starting.href,
                  category: starting.module,
                  progress: 15,
                }
              : state.lastTopic,
        }));
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("dataprep_experience_tier", tier);
          } catch {}
        }
      },

      toggleBookmark: (id) => {
        const current = get().bookmarks;
        const exists = current.includes(id);
        const updated = exists ? current.filter((b) => b !== id) : [...current, id];
        set({ bookmarks: updated });

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("dataprep_bookmarks", JSON.stringify(updated));
          } catch {}
        }
        return !exists; // true if newly added, false if removed
      },

      isBookmarked: (id) => {
        return get().bookmarks.includes(id);
      },

      setBookmarks: (bookmarks) => {
        const safe = Array.isArray(bookmarks) ? bookmarks.filter((x): x is string => typeof x === "string") : [];
        set({ bookmarks: safe });
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("dataprep_bookmarks", JSON.stringify(safe));
          } catch {}
        }
      },

      recordLastTopic: (topic) => {
        const payload: LastTopicData = {
          title: topic.title,
          href: topic.href,
          category: topic.category || "Last Visited",
          progress: typeof topic.progress === "number" ? topic.progress : 50,
        };
        set({ lastTopic: payload });

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              "dataprep_last_topic",
              JSON.stringify({ ...payload, timestamp: Date.now() })
            );
          } catch {}
        }
      },

      recordReviewedCard: (xpGain = 25) => {
        set((state) => {
          const nextData: UserData = {
            reviewedCount: state.userData.reviewedCount + 1,
            xp: state.userData.xp + xpGain,
            lastActive: new Date().toISOString(),
          };
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("dataprep_userdata", JSON.stringify(nextData));
            } catch {}
          }
          return { userData: nextData };
        });
      },

      recordDecision: (decisionId, choiceId) => {
        set((state) => ({
          decisionLedger: {
            ...state.decisionLedger,
            [decisionId]: choiceId,
          },
        }));
      },

      setDiagnosticScore: (score, recommendedTier) => {
        set((state) => {
          const tier = recommendedTier || state.experienceTier;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("dataprep_experience_tier", tier);
            } catch {}
          }
          return {
            diagnosticScore: score,
            experienceTier: tier,
          };
        });
      },

      resetProgress: () => {
        set({
          experienceTier: DEFAULT_TIER,
          bookmarks: [],
          lastTopic: DEFAULT_TOPIC,
          userData: { xp: 0, reviewedCount: 0, lastActive: new Date().toISOString() },
          decisionLedger: {},
          diagnosticScore: null,
        });
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("dataprep_bookmarks");
            localStorage.removeItem("dataprep_userdata");
            localStorage.removeItem("dataprep_last_topic");
            localStorage.removeItem("dataprep_experience_tier");
          } catch {}
        }
      },
    }),
    {
      name: "dataprep_user_store_v1",
      storage: createJSONStorage(() => localStorage),
      // Hydration guard & merge legacy data if store is fresh
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const legacy = getInitialLegacyData();
        if (legacy.experienceTier && (!state.experienceTier || state.experienceTier === DEFAULT_TIER)) {
          state.experienceTier = legacy.experienceTier;
        }
        if (legacy.bookmarks && legacy.bookmarks.length > 0 && state.bookmarks.length === 0) {
          state.bookmarks = legacy.bookmarks;
        }
        if (legacy.userData && state.userData.xp === 650 && state.userData.reviewedCount === 42) {
          state.userData = legacy.userData;
        }
        if (legacy.lastTopic && state.lastTopic.title === DEFAULT_TOPIC.title) {
          state.lastTopic = legacy.lastTopic;
        }
      },
    }
  )
);
