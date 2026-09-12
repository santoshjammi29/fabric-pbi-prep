"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Mail,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export function ArchitectDigest() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSubscribed(true);
    toast.success("Welcome to the Architect Digest! Study guide unlocked.");
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/70 dark:via-[#111126] dark:to-blue-950/70 border border-purple-200 dark:border-purple-500/30 p-8 sm:p-10 isolate shadow-sm dark:shadow-none">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-500/30 uppercase tracking-wider">
            <Sparkles size={13} className="text-purple-600 dark:text-purple-400" />
            <span>Weekly Architect Digest</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Level Up from Senior Engineer to Principal Architect
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Get curated weekly production blueprints, deep-dive Lakehouse trade-offs, and FAANG interview
            rubrics delivered directly with zero spam.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300 pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-green-400" /> 100% Free Forever
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-purple-600 dark:text-purple-400" /> No Spam Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-blue-600 dark:text-blue-400" /> 6,100+ Q&amp;A Archive
            </span>
          </div>
        </div>

        {/* Subscription Form Card */}
        <div className="w-full md:w-80 shrink-0 p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] shadow-md space-y-3">
          {!isSubscribed ? (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <label htmlFor="digest-email" className="text-xs font-bold text-[var(--foreground)] block">
                Subscribe for Weekly Cheat Sheets:
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                />
                <input
                  id="digest-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="architect@company.com"
                  aria-label="Email address for weekly cheat sheets"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-purple-500 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-purple-500/25 flex items-center justify-center gap-1.5"
              >
                <span>Join 15,000+ Architects</span>
                <ArrowRight size={14} />
              </button>
            </form>
          ) : (
            <div className="py-4 text-center space-y-2 animate-in fade-in duration-300">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-green-500/20 text-emerald-700 dark:text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={20} />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">You&rsquo;re on the VIP list!</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Check your inbox for the 2026 Lakehouse Architecture Reference PDF.
              </p>
            </div>
          )}

          <div className="pt-2 text-center text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/5">
            Or explore all{" "}
            <Link href="/learning-paths" className="text-purple-700 dark:text-purple-300 underline font-semibold">
              12 Learning Paths
            </Link>{" "}
            directly.
          </div>
        </div>
      </div>
    </section>
  );
}
