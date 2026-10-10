"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { learningPathsDb } from "@/data";
import { EXPERIENCE_TIERS, ExperienceTier } from "@/lib/user-progress";

interface Crumb {
  label: string;
  href?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  "/": "Home",
  "/learning-paths": "Learning Paths",
  "/architecture": "Architecture Hub",
  "/spark-engine": "Spark Engine Hub",
  "/modern-stack": "Modern Data Stack",
  "/concepts": "Key Concepts",
  "/code-practice": "Code Practice",
  "/python": "Python Data Hub",
  "/qa-prep": "Q&A Prep",
  "/de-mindmap": "Data Engineering Mindmap",
  "/company-research": "Company Research",
  "/studio": "My Learning Studio",
  "/diagnostic": "Skill Diagnostic",
  "/guided-learning": "Guided Learning",
  "/cheat-sheet": "Production Cheat Sheet",
};

const SPARK_TABS: Record<string, string> = {
  architecture: "Unified Data Plane",
  simulator: "DAG & Shuffle Simulator",
  memory: "Tungsten Memory Mapper",
  curriculum: "32-Level PySpark Curriculum",
  lexicon: "Architect's Lexicon",
};

const MODERN_TABS: Record<string, string> = {
  overview: "Interactive Canvas",
  concepts: "Modern Concepts",
  matrix: "Code Translation Matrix",
  simulators: "Interactive Simulators",
  blueprints: "Architectural Blueprints",
  ai: "AI & LLM Data Engineering",
  cost: "FinOps Playbooks",
  compatibility: "Cross-Engine Compatibility",
  python: "Python Sheets",
};

function BreadcrumbsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const crumbs: Crumb[] = useMemo(() => {
    const list: Crumb[] = [{ label: "Home", href: "/" }];

    if (pathname === "/") {
      const tier = searchParams.get("tier");
      if (tier) {
        const tierKey = (
          tier === "1"
            ? "beginner"
            : tier === "2"
            ? "associate"
            : tier === "3"
            ? "senior"
            : tier === "4"
            ? "staff_architect"
            : tier
        ) as ExperienceTier;
        const config = EXPERIENCE_TIERS[tierKey];
        if (config) {
          list.push({ label: `${config.label} (Tier)` });
        }
      }
      return list;
    }

    // Secondary routes
    const routeLabel = ROUTE_LABELS[pathname] || pathname.replace("/", "").replace(/-/g, " ");
    list.push({ label: routeLabel, href: pathname });

    // Inspect route-specific query params
    if (pathname === "/learning-paths") {
      const pathId = searchParams.get("card") || searchParams.get("id");
      if (pathId) {
        const match = learningPathsDb.find((p) => p.id === pathId || p.slug === pathId);
        list.push({
          label: match ? match.title : `Path: ${pathId}`,
        });
      }
    } else if (pathname === "/spark-engine") {
      const tab = searchParams.get("tab")?.toLowerCase();
      const flow = searchParams.get("flow")?.toLowerCase();
      if (tab && SPARK_TABS[tab]) {
        list.push({
          label: SPARK_TABS[tab],
          href: `/spark-engine?tab=${tab}`,
        });
      }
      if (flow) {
        list.push({
          label: `Flow: ${flow.charAt(0).toUpperCase() + flow.slice(1)}`,
        });
      }
    } else if (pathname === "/modern-stack") {
      const tab = searchParams.get("tab")?.toLowerCase();
      if (tab && MODERN_TABS[tab]) {
        list.push({
          label: MODERN_TABS[tab],
          href: `/modern-stack?tab=${tab}`,
        });
      }
    } else if (pathname === "/concepts") {
      const term = searchParams.get("term");
      const category = searchParams.get("category");
      const tab = searchParams.get("tab");
      if (tab === "python") {
        list.push({ label: "Python Reference", href: "/concepts?tab=python" });
      }
      if (category && category !== "ALL") {
        list.push({ label: category, href: `/concepts?category=${encodeURIComponent(category)}` });
      }
      if (term) {
        list.push({ label: term });
      }
    } else if (pathname === "/architecture") {
      const category = searchParams.get("category");
      const difficulty = searchParams.get("difficulty");
      const card = searchParams.get("card") || searchParams.get("id");
      const q = searchParams.get("q");
      if (category && category !== "ALL") {
        list.push({ label: category, href: `/architecture?category=${encodeURIComponent(category)}` });
      }
      if (difficulty && difficulty !== "ALL") {
        list.push({ label: `${difficulty} Level`, href: `/architecture?difficulty=${difficulty}` });
      }
      if (q) {
        list.push({ label: `"${q.length > 25 ? q.slice(0, 25) + "..." : q}"` });
      } else if (card) {
        list.push({ label: `Scenario #${card}` });
      }
    } else if (pathname === "/guided-learning") {
      const topic = searchParams.get("topic");
      if (topic) {
        list.push({ label: `${topic.toUpperCase()} Track` });
      }
    } else if (pathname === "/code-practice") {
      const cat = searchParams.get("category");
      if (cat && cat !== "ALL") {
        list.push({ label: cat });
      }
    } else if (pathname === "/qa-prep") {
      const domain = searchParams.get("domain") || searchParams.get("category");
      if (domain && domain !== "ALL") {
        list.push({ label: domain });
      }
    }

    return list;
  }, [pathname, searchParams]);

  // Don't render redundant single-item breadcrumbs on root page without query params
  if (crumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-5 px-1 animate-in fade-in duration-200">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;

          return (
            <li key={`${crumb.label}-${idx}`} className="inline-flex items-center gap-1.5">
              {idx > 0 && (
                <ChevronRight size={13} className="text-[var(--border-hover)] shrink-0" aria-hidden="true" />
              )}
              {idx === 0 ? (
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 hover:text-[var(--foreground)] transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                  title="Return to Home"
                >
                  <Home size={13} className="shrink-0" />
                  <span className="sr-only">Home</span>
                </Link>
              ) : isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-[var(--foreground)] max-w-[280px] sm:max-w-md truncate"
                >
                  {crumb.label}
                </span>
              ) : crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-[var(--foreground)] transition-colors truncate max-w-[200px]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate max-w-[200px]">{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Breadcrumbs() {
  return (
    <React.Suspense fallback={null}>
      <BreadcrumbsInner />
    </React.Suspense>
  );
}
