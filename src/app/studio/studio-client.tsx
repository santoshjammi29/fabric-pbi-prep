"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Flame,
  Zap,
  Bookmark,
  Award,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface StudioUserData {
  streak: number;
  xp: number;
  bookmarks: string[];
  reviewedCount: number;
  lastActive: string;
}

export function StudioClient() {
  const [userData, setUserData] = useState<StudioUserData>({
    streak: 3,
    xp: 650,
    bookmarks: [],
    reviewedCount: 42,
    lastActive: new Date().toISOString(),
  });

  const [bookmarkedItems, setBookmarkedItems] = useState<
    Array<{ id: string; title: string; type: string; href: string }>
  >([]);

  // Load user data & bookmarks asynchronously
  useEffect(() => {
    try {
      let bmList: string[] = [];
      const savedBm = localStorage.getItem("dataprep_bookmarks");
      if (savedBm) {
        try {
          const parsed = JSON.parse(savedBm);
          if (Array.isArray(parsed)) {
            bmList = parsed.filter((x): x is string => typeof x === "string");
          }
        } catch {}
      }

      const savedData = localStorage.getItem("dataprep_userdata");
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData && typeof parsedData === "object") {
            setUserData({
              ...parsedData,
              bookmarks: Array.isArray(parsedData.bookmarks) ? parsedData.bookmarks : bmList,
            });
          }
        } catch {}
      } else {
        setUserData((prev) => ({ ...prev, bookmarks: bmList }));
      }

      // Resolve bookmarked items via zero-bundle DAL API
      if (bmList.length > 0) {
        fetch("/api/bookmarks/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: bmList }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.items)) {
              setBookmarkedItems(data.items);
            }
          })
          .catch(() => {
            // Fallback placeholder list if network is offline
            setBookmarkedItems(
              bmList.map((id) => ({
                id,
                title: `Saved Item (${id})`,
                type: "saved",
                href: "/studio",
              }))
            );
          });
      }
    } catch {
      // ignore
    }
  }, []);

  const removeBookmark = (id: string) => {
    const nextBm = userData.bookmarks.filter((b) => b !== id);
    const nextUserData = { ...userData, bookmarks: nextBm };
    setUserData(nextUserData);
    setBookmarkedItems((prev) => prev.filter((i) => i.id !== id));
    try {
      localStorage.setItem("dataprep_bookmarks", JSON.stringify(nextBm));
      localStorage.setItem("dataprep_userdata", JSON.stringify(nextUserData));
      toast.info("Bookmark removed");
    } catch {
      // ignore
    }
  };

  const exportBackupJSON = () => {
    const backup = {
      version: "2.0",
      exportDate: new Date().toISOString(),
      userData,
      bookmarks: userData.bookmarks,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-platform-prep-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Progress exported successfully!");
  };

  const importBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (!parsed.bookmarks || !Array.isArray(parsed.bookmarks)) {
          throw new Error("Invalid backup schema");
        }
        localStorage.setItem("dataprep_bookmarks", JSON.stringify(parsed.bookmarks));
        if (parsed.userData) {
          localStorage.setItem("dataprep_userdata", JSON.stringify(parsed.userData));
          setUserData(parsed.userData);
        }
        toast.success("Progress imported successfully! Reloading...");
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        toast.error("Failed to import backup: invalid JSON schema");
      }
    };
    reader.readAsText(file);
  };

  const resetAllProgress = () => {
    if (confirm("Are you sure you want to reset all bookmarks and study streaks?")) {
      localStorage.removeItem("dataprep_bookmarks");
      localStorage.removeItem("dataprep_userdata");
      setUserData({
        streak: 1,
        xp: 0,
        bookmarks: [],
        reviewedCount: 0,
        lastActive: new Date().toISOString(),
      });
      setBookmarkedItems([]);
      toast.info("All local data reset.");
    }
  };

  return (
    <div className="space-y-3.5 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-3.5 sm:p-4.5 isolate shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1 max-w-4xl 2xl:max-w-6xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
              <User size={12} />
              <span>Personal Learning Studio</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
              My Progress &amp; Architect Studio
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Track your daily review streak, active SM-2 retention levels, saved code templates, and
              manage offline JSON data backups.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportBackupJSON}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download size={13} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-0.5">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span className="text-[11px] font-medium">Daily Streak</span>
            <Flame size={15} className="text-orange-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-[var(--foreground)]">{userData.streak} Days</div>
          <div className="text-[10px] text-green-500 font-medium">Active streak</div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-0.5">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span className="text-[11px] font-medium">Weekly XP</span>
            <Zap size={15} className="text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-[var(--foreground)]">{userData.xp} XP</div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Top 5% Learner</div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-0.5">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span className="text-[11px] font-medium">Saved Bookmarks</span>
            <Bookmark size={15} className="text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-[var(--foreground)]">{bookmarkedItems.length} Saved</div>
          <div className="text-[10px] text-[var(--muted-foreground)] font-medium">Concepts &amp; Q&amp;As</div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-0.5">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span className="text-[11px] font-medium">Mastery Rank</span>
            <Award size={15} className="text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">Principal</div>
          <div className="text-[10px] text-blue-500/80 font-medium">Level 4 Architect</div>
        </div>
      </div>

      {/* Bookmarks & Storage Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Bookmarks List */}
        <div className="lg:col-span-2 p-3 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
              <Bookmark size={15} className="text-amber-400" />
              Saved Bookmarks ({bookmarkedItems.length})
            </h3>
          </div>

          {bookmarkedItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--muted-foreground)] space-y-1">
              <p>No bookmarks saved yet.</p>
              <p>Click the bookmark ribbon on any Concept or Q&amp;A card to save it here for quick access.</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
              {bookmarkedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-blue-500/40 text-xs transition-all group"
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 min-w-0 pr-2 flex-1 hover:text-blue-500 transition-colors"
                  >
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase shrink-0">
                      {item.type}
                    </span>
                    <span className="font-semibold text-[var(--foreground)] group-hover:text-blue-500 transition-colors truncate">
                      {item.title}
                    </span>
                  </Link>
                  <button
                    onClick={() => removeBookmark(item.id)}
                    className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                    title="Remove Bookmark"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Local Storage & Backup Tools */}
        <div className="p-3 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
              Data &amp; Local Persistence
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              All your study progress, SM-2 ratings, and bookmarks are securely stored in your browser&rsquo;s local storage.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="block w-full">
                <input type="file" accept=".json" onChange={importBackupJSON} className="hidden" />
                <div className="w-full py-1.5 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-3)] cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                  <Upload size={13} />
                  <span>Import JSON Backup</span>
                </div>
              </label>

              <button
                onClick={resetAllProgress}
                className="w-full py-1.5 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Reset All Data</span>
              </button>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[var(--surface-2)] text-[10px] text-[var(--muted-foreground)] flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-green-500 shrink-0" />
            <span>Zero cloud tracking. 100% private offline-first app.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudioClient;
