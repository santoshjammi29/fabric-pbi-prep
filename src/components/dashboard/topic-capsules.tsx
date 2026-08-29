"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Layers,
  Database,
  Flame,
  Bot,
  ShieldCheck,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Topic {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

const topics: Topic[] = [
  { id: "all", label: "⚡ All 8 Domains", icon: Sparkles, href: "/qa-prep" },
  { id: "fabric", label: "Fabric & OneLake", icon: Database, href: "/concepts?term=Fabric" },
  { id: "spark", label: "Spark 4.0 Internals", icon: Flame, href: "/spark-engine" },
  { id: "lakehouse", label: "Delta & Iceberg", icon: Layers, href: "/modern-stack" },
  { id: "code", label: "Polyglot Practice", icon: Code2, href: "/code-practice" },
  { id: "ai", label: "AI & Vector RAG", icon: Bot, href: "/modern-stack#ai" },
  { id: "finops", label: "FinOps & Tuning", icon: Zap, href: "/modern-stack#cost" },
  { id: "governance", label: "Mesh & Contracts", icon: ShieldCheck, href: "/architecture" },
];

export function TopicCapsules() {
  const [activeId, setActiveId] = useState("all");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
        <span className="font-bold uppercase tracking-wider text-[11px] text-[var(--foreground)]">
          Explore by Architecture Focus
        </span>
        <Link href="/qa-prep" className="text-purple-400 hover:underline font-medium">
          View all 2,600+ Questions &rarr;
        </Link>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {topics.map((t) => {
          const Icon = t.icon;
          const isActive = activeId === t.id;
          return (
            <Link
              key={t.id}
              href={t.href}
              onClick={() => setActiveId(t.id)}
              className={cn(
                "category-capsule",
                isActive ? "category-capsule-active" : "category-capsule-idle"
              )}
            >
              <Icon size={14} className={isActive ? "text-purple-400" : "opacity-70"} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
