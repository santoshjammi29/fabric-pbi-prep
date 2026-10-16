"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopicIcon } from "@/components/ui/topic-icon";

interface Topic {
  id: string;
  label: string;
  topicKey?: string;
  icon?: React.ElementType;
  href: string;
}

const topics: Topic[] = [
  { id: "all", label: "All 13 Tracks", icon: Sparkles, href: "/guided-learning" },
  { id: "python", label: "Python for DE", topicKey: "python", href: "/guided-learning?topic=python" },
  { id: "simulators", label: "6 Live Simulators", topicKey: "spark", href: "/modern-stack#simulators" },
  { id: "fabric", label: "Fabric & OneLake", topicKey: "fabric", href: "/concepts?term=Fabric" },
  { id: "synapse-fabric", label: "Synapse & Fabric Masterclass", topicKey: "azure", href: "/modern-stack#blueprints" },
  { id: "spark", label: "Spark 4.0 Internals", topicKey: "spark", href: "/spark-engine" },
  { id: "blueprints", label: "Whiteboard Blueprints", icon: Sparkles, href: "/architecture?tab=diagrams" },
  { id: "lakehouse", label: "Delta & Iceberg", topicKey: "datalake", href: "/modern-stack" },
  { id: "code", label: "Polyglot Practice", topicKey: "sql", href: "/code-practice" },
  { id: "ai", label: "AI & Vector RAG", topicKey: "ai", href: "/modern-stack#ai" },
  { id: "finops", label: "FinOps & Tuning", topicKey: "finops", href: "/modern-stack#cost" },
  { id: "governance", label: "Mesh & Contracts", topicKey: "unitycatalog", href: "/architecture" },
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
          View all 6,570+ Questions &rarr;
        </Link>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
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
              {t.topicKey ? (
                <TopicIcon topic={t.topicKey} size={14} className="shrink-0" />
              ) : Icon ? (
                <Icon size={14} className={isActive ? "text-purple-400 shrink-0" : "opacity-70 shrink-0"} />
              ) : null}
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
