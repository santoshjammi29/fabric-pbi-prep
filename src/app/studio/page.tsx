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
import {
  conceptsDb,
  questionsDb,
  questionsDeDb,
  architectureData,
  pythonData,
  pysparkData,
  sparksqlData,
  mssqlData,
} from "@/data";

interface StudioUserData {
  streak: number;
  xp: number;
  bookmarks: string[];
  reviewedCount: number;
  lastActive: string;
}

export default function StudioPage() {
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

  // Load user data & bookmarks
  useEffect(() => {
    try {
      const savedBm = localStorage.getItem("dataprep_bookmarks");
      const bmList: string[] = savedBm ? JSON.parse(savedBm) : [];

      const savedData = localStorage.getItem("dataprep_userdata");
      if (savedData) {
        setUserData(JSON.parse(savedData));
      } else {
        setUserData((prev) => ({ ...prev, bookmarks: bmList }));
      }

      // Resolve bookmarked items across all databases
      const resolved: Array<{ id: string; title: string; type: string; href: string }> = [];
      bmList.forEach((id) => {
        const c = conceptsDb.find((item) => item.id === id);
        if (c) {
          resolved.push({ id: c.id, title: c.term, type: "concept", href: `/concepts?term=${encodeURIComponent(c.term)}` });
          return;
        }
        const q = questionsDb.find((item) => item.id === id);
        if (q) {
          resolved.push({ id: q.id, title: q.question, type: "q&a", href: "/qa-prep" });
          return;
        }
        const de = questionsDeDb.find((item) => item.id === id);
        if (de) {
          resolved.push({ id: de.id, title: de.question, type: "de q&a", href: "/qa-prep" });
          return;
        }
        const arch = architectureData.find((item) => item.id === id);
        if (arch) {
          resolved.push({ id: arch.id, title: arch.question, type: "scenario", href: "/architecture" });
          return;
        }
        const py = pythonData.find((item) => item.id === id);
        if (py) {
          resolved.push({ id: py.id, title: py.title, type: "python", href: "/python" });
          return;
        }
        const psp = pysparkData.find((item) => item.id === id);
        if (psp) {
          resolved.push({ id: psp.id, title: psp.title, type: "pyspark", href: "/code-practice?db=pyspark" });
          return;
        }
        const ssql = sparksqlData.find((item) => item.id === id);
        if (ssql) {
          resolved.push({ id: ssql.id, title: ssql.title, type: "spark sql", href: "/code-practice?db=sparksql" });
          return;
        }
        const msql = mssqlData.find((item) => item.id === id);
        if (msql) {
          resolved.push({ id: msql.id, title: msql.title, type: "t-sql", href: "/code-practice?db=mssql" });
          return;
        }
        resolved.push({ id, title: `Saved Item (${id})`, type: "saved", href: "/studio" });
      });
      setBookmarkedItems(resolved);
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
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
              <User size={14} />
              <span>Personal Learning Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              My Progress &amp; Architect Studio
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Track your daily review streak, active SM-2 retention levels, saved code templates, and
              manage offline JSON data backups.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={exportBackupJSON}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
              <Download size={15} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>Daily Streak</span>
            <Flame size={18} className="text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)]">{userData.streak} Days 🔥</div>
          <div className="text-[11px] text-green-400 font-medium">Keep it going!</div>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>Weekly XP</span>
            <Zap size={18} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)]">{userData.xp} XP ⚡</div>
          <div className="text-[11px] text-purple-400 font-medium">Top 5% Learner</div>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>Saved Bookmarks</span>
            <Bookmark size={18} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)]">{bookmarkedItems.length} Saved</div>
          <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Concepts &amp; Q&As</div>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>Mastery Rank</span>
            <Award size={18} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">Principal</div>
          <div className="text-[11px] text-blue-300 font-medium">Level 4 Architect</div>
        </div>
      </div>

      {/* Bookmarks & Storage Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookmarks List */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Bookmark size={18} className="text-amber-400" />
              Saved Bookmarks ({bookmarkedItems.length})
            </h3>
          </div>

          {bookmarkedItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--muted-foreground)] space-y-2">
              <p>No bookmarks saved yet.</p>
              <p>Click the bookmark ribbon on any Concept or Q&A card to save it here for quick access.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {bookmarkedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-purple-500/40 text-xs sm:text-sm transition-all group"
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-2.5 min-w-0 pr-2 flex-1 hover:text-purple-300 transition-colors"
                  >
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 uppercase shrink-0">
                      {item.type}
                    </span>
                    <span className="font-semibold text-[var(--foreground)] group-hover:text-purple-300 transition-colors truncate">
                      {item.title}
                    </span>
                  </Link>
                  <button
                    onClick={() => removeBookmark(item.id)}
                    className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    title="Remove Bookmark"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Local Storage & Backup Tools */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[var(--foreground)]">
              Data &amp; Local Persistence
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              All your study progress, SM-2 ratings, and bookmarks are securely stored in your browser&rsquo;s local storage.
            </p>

            <div className="space-y-3 pt-2">
              <label className="block w-full">
                <input type="file" accept=".json" onChange={importBackupJSON} className="hidden" />
                <div className="w-full py-2.5 px-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-3)] cursor-pointer flex items-center justify-center gap-2 transition-colors">
                  <Upload size={14} />
                  <span>Import JSON Backup</span>
                </div>
              </label>

              <button
                onClick={resetAllProgress}
                className="w-full py-2.5 px-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                <span>Reset All Data</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--surface-2)] text-[11px] text-[var(--muted-foreground)] flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-400 shrink-0" />
            <span>Zero cloud tracking. 100% private offline-first app.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
