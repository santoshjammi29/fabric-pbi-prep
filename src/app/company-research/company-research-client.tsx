"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Search,
  Sparkles,
  Globe,
  MessageSquare,
  MapPin,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Briefcase,
  X,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HubSubnav } from "@/components/layout/hub-subnav";
import { TopicIcon } from "@/components/ui/topic-icon";
import { UnifiedSearchFilterBox } from "@/components/ui/unified-search-filter-box";
import type { CompanyProfile, CompanyTier } from "@/types/data";

const POPULAR_TECHS = [
  "All",
  "Databricks",
  "Snowflake",
  "Apache Spark",
  "Apache Kafka",
  "Apache Flink",
  "Apache Iceberg",
  "Delta Lake",
  "BigQuery",
  "Microsoft Fabric",
  "ClickHouse",
  "dbt",
] as const;

const TOP_HUBS = [
  "All Hubs",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Gurugram",
  "Mumbai",
  "US / Global",
] as const;

const ITEMS_PER_PAGE = 24;

export function CompanyResearchClient({ initialProfiles }: { initialProfiles: CompanyProfile[] }) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedTech, setSelectedTech] = useState<string>("All");
  const [selectedStretch, setSelectedStretch] = useState<"ALL" | "STANDARD" | "STRETCH">("ALL");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Reactively synchronize from searchParams
  useEffect(() => {
    const qParam = searchParams.get("q") || searchParams.get("company") || searchParams.get("search");
    const tierParam = searchParams.get("tier");
    const techParam = searchParams.get("tech");
    const stretchParam = searchParams.get("stretch") as "ALL" | "STANDARD" | "STRETCH" | null;

    if (qParam !== null) {
      setSearchQuery(qParam);
    }
    if (tierParam) {
      setSelectedTier(tierParam);
    }
    if (techParam) {
      setSelectedTech(techParam);
    }
    if (stretchParam && ["ALL", "STANDARD", "STRETCH"].includes(stretchParam)) {
      setSelectedStretch(stretchParam);
    }
  }, [searchParams]);

  // Compute counts per tier
  const tierCounts = useMemo(() => {
    const counts = {
      ALL: initialProfiles.length,
      "Tier 1 FAANG / BigTech": 0,
      "Tier 1 Global FinTech": 0,
      "Global Capability Center (GCC)": 0,
    };
    initialProfiles.forEach((c) => {
      if (counts[c.tier] !== undefined) {
        counts[c.tier]++;
      }
    });
    return counts;
  }, [initialProfiles]);

  // Compute counts per stretch
  const stretchCounts = useMemo(() => {
    let standard = 0;
    let stretch = 0;
    initialProfiles.forEach((c) => {
      if (c.tier === "Global Capability Center (GCC)") standard++;
      else stretch++;
    });
    return { ALL: initialProfiles.length, STANDARD: standard, STRETCH: stretch };
  }, [initialProfiles]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleCopyPrompt = useCallback((key: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  }, []);

  // Filtered dataset
  const filteredCompanies = useMemo(() => {
    return initialProfiles.filter((c) => {
      // Tier filter
      if (selectedTier !== "ALL" && c.tier !== selectedTier) return false;

      // Stretch filter (STANDARD = GCCs, STRETCH = BigTech / FinTech)
      if (selectedStretch === "STANDARD" && c.tier !== "Global Capability Center (GCC)") return false;
      if (selectedStretch === "STRETCH" && c.tier === "Global Capability Center (GCC)") return false;

      // Tech filter
      if (selectedTech !== "All") {
        const hasTech = c.stack.some((tech) =>
          tech.toLowerCase().includes(selectedTech.toLowerCase())
        );
        if (!hasTech) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesLocation = c.location.toLowerCase().includes(q);
        const matchesHubs = c.hiringGCCLocations?.some((h) =>
          h.toLowerCase().includes(q)
        );
        const matchesStack = c.stack.some((s) => s.toLowerCase().includes(q));
        const matchesArchetype = c.systemDesignArchetype?.toLowerCase().includes(q);
        const matchesFocus = c.interviewFocus.some((f) =>
          f.toLowerCase().includes(q)
        );
        const matchesChallenge = c.keyChallenges.toLowerCase().includes(q);
        const matchesSample = c.sampleQuestions?.some((sq) =>
          sq.toLowerCase().includes(q)
        );

        return (
          matchesName ||
          matchesLocation ||
          matchesHubs ||
          matchesStack ||
          matchesArchetype ||
          matchesFocus ||
          matchesChallenge ||
          matchesSample
        );
      }

      return true;
    });
  }, [selectedTier, selectedStretch, selectedTech, searchQuery]);

  const displayedCompanies = useMemo(() => {
    return filteredCompanies.slice(0, visibleCount);
  }, [filteredCompanies, visibleCount]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTier("ALL");
    setSelectedTech("All");
    setSelectedStretch("ALL");
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  return (
    <div className="space-y-3.5 pb-20 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Subnav */}
      <HubSubnav
        hubTitle="Q&A & Interview Prep"
        items={[
          {
            label: "Question Drill Bank",
            href: "/qa-prep",
            icon: MessageSquare,
            badge: "6,570+ Qs",
          },
          {
            label: "Target Company Intel",
            href: "/company-research",
            icon: Building2,
            badge: "156 Targets",
            badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
          },
        ]}
      />

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-4 isolate shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
              <Building2 size={11} />
              <span>Enterprise Hiring &amp; Compensation Intel</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] break-words">
              Target Company Intel &amp; Architectural Rubrics
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
              In-depth architectural dossiers across <strong className="text-[var(--foreground)]">156 verified enterprises</strong>.
              Review production tech stacks, verified Senior DE &amp; Principal Architect salary benchmarks (USD + INR),
              system design archetypes, and real interview prompts asked in hiring loops.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 shrink-0 text-center">
            <div className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">156</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
                Companies
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-sm sm:text-base font-bold text-emerald-500 dark:text-emerald-400">3 Tiers</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
                50+ Per Tier
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-sm sm:text-base font-bold text-cyan-500 dark:text-cyan-400">312+</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
                Design Qs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── UNIFIED SEARCH & MULTI-LEVEL FILTER BOX ─── */}
      <UnifiedSearchFilterBox
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setVisibleCount(ITEMS_PER_PAGE);
        }}
        searchPlaceholder="Search 156+ companies by name, tech (e.g. Databricks, Flink, Iceberg), hub, or interview topic... (Press / to search)"
        matchCount={filteredCompanies.length}
        totalCount={initialProfiles.length}
        countUnit="companies"
        themeAccent="blue"
        hasActiveFilters={
          selectedTier !== "ALL" ||
          selectedTech !== "All" ||
          selectedStretch !== "ALL" ||
          searchQuery.trim().length > 0
        }
        onResetAll={handleResetFilters}
        levels={[
          {
            id: "tech",
            title: "Level 1: Topics (Target Tech Stack)",
            shortTitle: "Topics",
            icon: <SlidersHorizontal size={13} className="text-blue-500 dark:text-blue-400" />,
            layout: "chips",
            accentColor: "blue",
            selectedId: selectedTech,
            onSelect: (tech) => {
              setSelectedTech(tech);
              setVisibleCount(ITEMS_PER_PAGE);
            },
            options: POPULAR_TECHS.map((tech) => ({
              id: tech,
              label: tech === "All" ? "All Tech Stacks" : tech,
            })),
          },
          {
            id: "tier",
            title: "Level 2: Difficulty (Enterprise Tier)",
            shortTitle: "Difficulty",
            icon: <TrendingUp size={13} className="text-purple-400" />,
            layout: "chips",
            accentColor: "purple",
            selectedId: selectedTier,
            onSelect: (key) => {
              setSelectedTier(key);
              setVisibleCount(ITEMS_PER_PAGE);
            },
            options: [
              { id: "ALL", label: "All Companies", count: tierCounts.ALL },
              {
                id: "Tier 1 FAANG / BigTech",
                label: "Tier 1 BigTech",
                count: tierCounts["Tier 1 FAANG / BigTech"],
              },
              {
                id: "Tier 1 Global FinTech",
                label: "Tier 1 FinTech",
                count: tierCounts["Tier 1 Global FinTech"],
              },
              {
                id: "Global Capability Center (GCC)",
                label: "Enterprise GCCs",
                count: tierCounts["Global Capability Center (GCC)"],
              },
            ],
          },
          {
            id: "stretch",
            title: "Level 3: Stretch (Standard GCC vs Deep BigTech/FinTech)",
            shortTitle: "Stretch",
            icon: <Flame size={13} className="text-orange-400" />,
            layout: "chips",
            accentColor: "amber",
            selectedId: selectedStretch,
            onSelect: (val) => {
              setSelectedStretch(val as "ALL" | "STANDARD" | "STRETCH");
              setVisibleCount(ITEMS_PER_PAGE);
            },
            options: [
              { id: "ALL", label: "ALL", count: stretchCounts.ALL },
              { id: "STANDARD", label: "STANDARD", count: stretchCounts.STANDARD },
              { id: "STRETCH", label: "STRETCH", count: stretchCounts.STRETCH },
            ],
          },
        ]}
        activeFilters={[
          ...(selectedTech !== "All"
            ? [
                {
                  id: "tech",
                  label: `Topic: ${selectedTech}`,
                  color: "bg-blue-500/10 border-blue-500/30 text-blue-400",
                  onRemove: () => {
                    setSelectedTech("All");
                    setVisibleCount(ITEMS_PER_PAGE);
                  },
                },
              ]
            : []),
          ...(selectedTier !== "ALL"
            ? [
                {
                  id: "tier",
                  label: `Tier: ${selectedTier}`,
                  color: "bg-purple-500/10 border-purple-500/30 text-purple-400",
                  onRemove: () => {
                    setSelectedTier("ALL");
                    setVisibleCount(ITEMS_PER_PAGE);
                  },
                },
              ]
            : []),
          ...(selectedStretch !== "ALL"
            ? [
                {
                  id: "stretch",
                  label: `Stretch: ${selectedStretch}`,
                  color: selectedStretch === "STANDARD"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-purple-500/10 border-purple-500/30 text-purple-400",
                  onRemove: () => {
                    setSelectedStretch("ALL");
                    setVisibleCount(ITEMS_PER_PAGE);
                  },
                },
              ]
            : []),
          ...(searchQuery.trim().length > 0
            ? [
                {
                  id: "search",
                  label: `Search: "${searchQuery}"`,
                  color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                  onRemove: () => {
                    setSearchQuery("");
                    setVisibleCount(ITEMS_PER_PAGE);
                  },
                },
              ]
            : []),
        ]}
      />

      {/* Empty State */}
      {filteredCompanies.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3">
          <Building2 size={36} className="mx-auto text-[var(--muted-foreground)] opacity-40" />
          <h3 className="text-base font-bold text-[var(--foreground)]">No companies match your filters</h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto">
            Try loosening your search query, selecting &ldquo;All Companies&rdquo;, or resetting your tech and hub filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors shadow-xs cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Company Cards Grid (Dense 2-column layout adhering to nextjs-compact-ui) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
        {displayedCompanies.map((company) => {
          const isExpanded = !!expandedIds[company.id];

          // Semantic Tier styling
          let tierBadgeStyle = "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20";
          if (company.tier === "Tier 1 Global FinTech") {
            tierBadgeStyle = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20";
          } else if (company.tier === "Global Capability Center (GCC)") {
            tierBadgeStyle = "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20";
          }

          return (
            <div
              key={company.id}
              className="rounded-xl border transition-all duration-200 bg-[var(--surface-1)] border-[var(--border)] hover:border-blue-500/40 p-3 sm:p-3.5 space-y-2.5 shadow-xs flex flex-col justify-between"
            >
              {/* Header: Logo, Name, Tier, Location, GCC Hubs */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <TopicIcon topic={company.topicKey} size={22} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight">
                        {company.name}
                      </h2>
                      <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Globe size={11} className="text-[var(--muted-foreground)] shrink-0" />
                          <span>{company.location}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap",
                      tierBadgeStyle
                    )}
                  >
                    {company.tier === "Global Capability Center (GCC)"
                      ? "Enterprise GCC"
                      : company.tier.replace("Tier 1 ", "")}
                  </span>
                </div>

                {/* GCC Hiring Hubs */}
                {company.hiringGCCLocations && company.hiringGCCLocations.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-0.5">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-0.5">
                      <MapPin size={10} className="text-cyan-400" /> Hubs:
                    </span>
                    {company.hiringGCCLocations.map((hub) => (
                      <span
                        key={hub}
                        className="px-1.5 py-0.2 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-medium"
                      >
                        {hub}
                      </span>
                    ))}
                  </div>
                )}

                {/* System Design Archetype Pill */}
                {company.systemDesignArchetype && (
                  <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-2 text-xs">
                    <Layers size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] mr-1">
                        System Design Archetype:
                      </span>
                      <span className="font-semibold text-[var(--foreground)] text-[11px] sm:text-xs break-words">
                        {company.systemDesignArchetype}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Salary Benchmarks */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-0.5">
                  <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold flex items-center gap-1">
                    <TrendingUp size={10} className="text-emerald-500 dark:text-emerald-400" />
                    <span>Senior Data Engineer</span>
                  </div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px] sm:text-xs">
                    {company.seniorDeSalary}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-0.5">
                  <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold flex items-center gap-1">
                    <Briefcase size={10} className="text-blue-500 dark:text-blue-400" />
                    <span>Principal Architect</span>
                  </div>
                  <div className="font-bold text-blue-600 dark:text-blue-400 font-mono text-[11px] sm:text-xs">
                    {company.architectSalary}
                  </div>
                </div>
              </div>

              {/* Tech Stack Chips */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Production Tech Stack:
                </div>
                <div className="flex flex-wrap gap-1">
                  {company.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[11px] font-mono text-[var(--foreground)] border border-[var(--border)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Architectural Interview Focus Topics */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--border)] text-xs">
                <div className="text-[11px] font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <Sparkles size={12} className="text-blue-500 dark:text-blue-400 shrink-0" />
                  <span>Key Architectural Interview Topics:</span>
                </div>
                <ul className="space-y-1 text-[var(--muted-foreground)] pl-1 text-[11px] sm:text-xs">
                  {company.interviewFocus.map((focus, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-blue-500 dark:text-blue-400 font-bold shrink-0">•</span>
                      <span className="break-words">{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Production Scale Challenge */}
              <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[11px] leading-relaxed text-[var(--muted-foreground)] break-words">
                <span className="font-bold text-[var(--foreground)]">Scale Challenge: </span>
                {company.keyChallenges}
              </div>

              {/* Real System Design Prompts (Interactive Accordion) */}
              {company.sampleQuestions && company.sampleQuestions.length > 0 && (
                <div className="pt-1">
                  <button
                    onClick={() => toggleExpand(company.id)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 text-blue-600 dark:text-blue-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <HelpCircle size={13} className="text-blue-500 dark:text-blue-400" />
                      <span>Real Interview System Design Prompts ({company.sampleQuestions.length})</span>
                    </span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-2 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] animate-in fade-in-50 duration-150">
                      {company.sampleQuestions.map((prompt, qIdx) => {
                        const copyKey = `${company.id}-prompt-${qIdx}`;
                        const isCopied = copiedKey === copyKey;

                        return (
                          <div
                            key={qIdx}
                            className="p-2 rounded-md bg-[var(--surface-1)] border border-[var(--border)] space-y-1.5 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Scenario Prompt #{qIdx + 1}
                              </span>
                              <button
                                onClick={() => handleCopyPrompt(copyKey, prompt)}
                                className="flex items-center gap-1 text-[10px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                                title="Copy prompt to clipboard"
                              >
                                {isCopied ? (
                                  <>
                                    <Check size={11} className="text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={11} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-[11px] sm:text-xs text-[var(--foreground)] leading-relaxed italic break-words whitespace-normal">
                              &ldquo;{prompt}&rdquo;
                            </p>
                          </div>
                        );
                      })}

                      <div className="pt-1 flex items-center justify-end">
                        <Link
                          href={`/architecture?category=${encodeURIComponent("Databricks Lakehouse Architecture")}`}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium"
                        >
                          <span>Practice architecture blueprints</span>
                          <ArrowRight size={11} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More Pagination */}
      {displayedCompanies.length < filteredCompanies.length && (
        <div className="pt-4 text-center space-y-2">
          <p className="text-xs text-[var(--muted-foreground)]">
            Showing {displayedCompanies.length} of {filteredCompanies.length} companies
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Load More Companies (+{ITEMS_PER_PAGE})
            </button>
            <button
              onClick={() => setVisibleCount(filteredCompanies.length)}
              className="px-4 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--foreground)] border border-[var(--border)] text-xs font-semibold transition-all cursor-pointer"
            >
              Show All ({filteredCompanies.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
