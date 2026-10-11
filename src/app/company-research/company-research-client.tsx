"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HubSubnav } from "@/components/layout/hub-subnav";
import { TopicIcon } from "@/components/ui/topic-icon";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedTech, setSelectedTech] = useState<string>("All");
  const [selectedHub, setSelectedHub] = useState<string>("All Hubs");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

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

      // Tech filter
      if (selectedTech !== "All") {
        const hasTech = c.stack.some((tech) =>
          tech.toLowerCase().includes(selectedTech.toLowerCase())
        );
        if (!hasTech) return false;
      }

      // Hub location filter
      if (selectedHub !== "All Hubs") {
        if (selectedHub === "US / Global") {
          const isUSGlobal =
            c.location.includes("CA") ||
            c.location.includes("WA") ||
            c.location.includes("NY") ||
            c.location.includes("TX") ||
            c.location.includes("Global") ||
            c.location.includes("Remote");
          if (!isUSGlobal) return false;
        } else {
          const matchesLoc =
            c.location.toLowerCase().includes(selectedHub.toLowerCase()) ||
            (c.hiringGCCLocations &&
              c.hiringGCCLocations.some((loc) =>
                loc.toLowerCase().includes(selectedHub.toLowerCase())
              ));
          if (!matchesLoc) return false;
        }
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
  }, [selectedTier, selectedTech, selectedHub, searchQuery]);

  const displayedCompanies = useMemo(() => {
    return filteredCompanies.slice(0, visibleCount);
  }, [filteredCompanies, visibleCount]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTier("ALL");
    setSelectedTech("All");
    setSelectedHub("All Hubs");
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  return (
    <div className="space-y-4 pb-20 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Subnav */}
      <HubSubnav
        hubTitle="Interview Drill Hub"
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
            badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
          },
          {
            label: "Production Cheat Sheet",
            href: "/cheat-sheet",
            icon: Sparkles,
            badge: "Cheat Codes",
          },
        ]}
      />

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-4 sm:p-5 isolate shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
              <Building2 size={13} />
              <span>Enterprise Hiring &amp; Compensation Intel</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Target Company Intel &amp; Architectural Rubrics
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              In-depth architectural dossiers across <strong className="text-[var(--foreground)]">156 verified enterprises</strong>.
              Review production tech stacks, verified Senior DE &amp; Principal Architect salary benchmarks (USD + INR),
              system design archetypes, and real interview prompts asked in hiring loops.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 shrink-0 text-center">
            <div className="px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-base sm:text-lg font-bold text-purple-400">156</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
                Companies
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-base sm:text-lg font-bold text-emerald-400">3 Tiers</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
                50+ Per Tier
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-base sm:text-lg font-bold text-cyan-400">312+</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
                Design Qs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Tier Filters */}
      <div className="space-y-2.5">
        {/* Row 1: Search Input & Tier Tabs */}
        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              placeholder="Search by company, tech (e.g. Databricks, Flink, Iceberg), hub, or interview topic..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-purple-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Tier Switcher */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shrink-0">
            {[
              { key: "ALL", label: "All Companies", count: tierCounts.ALL },
              {
                key: "Tier 1 FAANG / BigTech",
                label: "Tier 1 BigTech",
                count: tierCounts["Tier 1 FAANG / BigTech"],
              },
              {
                key: "Tier 1 Global FinTech",
                label: "Tier 1 FinTech",
                count: tierCounts["Tier 1 Global FinTech"],
              },
              {
                key: "Global Capability Center (GCC)",
                label: "Enterprise GCCs",
                count: tierCounts["Global Capability Center (GCC)"],
              },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setSelectedTier(t.key);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap",
                  selectedTier === t.key
                    ? "bg-purple-600 text-white shadow-sm font-semibold"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                )}
              >
                <span>{t.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                    selectedTier === t.key
                      ? "bg-white/20 text-white"
                      : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                  )}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Secondary Quick Filters (Tech Stack & Hiring Hubs) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto py-0.5">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <SlidersHorizontal size={11} /> Tech:
            </span>
            {POPULAR_TECHS.map((tech) => (
              <button
                key={tech}
                onClick={() => {
                  setSelectedTech(tech);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[11px] font-medium transition-all shrink-0 whitespace-nowrap border",
                  selectedTech === tech
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold"
                    : "bg-[var(--surface-1)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                )}
              >
                {tech}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto shrink-0 py-0.5">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <MapPin size={11} /> Hub:
            </span>
            {TOP_HUBS.map((hub) => (
              <button
                key={hub}
                onClick={() => {
                  setSelectedHub(hub);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[11px] font-medium transition-all shrink-0 whitespace-nowrap border",
                  selectedHub === hub
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold"
                    : "bg-[var(--surface-1)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                )}
              >
                {hub}
              </button>
            ))}
          </div>
        </div>

        {/* Results summary & Active filter reset */}
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
          <div>
            Showing <strong className="text-[var(--foreground)]">{displayedCompanies.length}</strong> of{" "}
            <strong className="text-[var(--foreground)]">{filteredCompanies.length}</strong> companies
            {selectedTier !== "ALL" && (
              <span> in <span className="text-purple-400 font-medium">{selectedTier}</span></span>
            )}
            {selectedTech !== "All" && (
              <span> with <span className="text-purple-400 font-medium">{selectedTech}</span></span>
            )}
            {selectedHub !== "All Hubs" && (
              <span> in <span className="text-cyan-400 font-medium">{selectedHub}</span></span>
            )}
          </div>

          {(selectedTier !== "ALL" ||
            selectedTech !== "All" ||
            selectedHub !== "All Hubs" ||
            searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-purple-400 hover:text-purple-300 underline font-medium"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

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
            className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Company Cards Grid (Dense 2-column layout adhering to nextjs-compact-ui) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-3.5">
        {displayedCompanies.map((company) => {
          const isExpanded = !!expandedIds[company.id];

          // Semantic Tier styling
          let tierBadgeStyle = "bg-purple-500/10 text-purple-300 border-purple-500/20";
          if (company.tier === "Tier 1 Global FinTech") {
            tierBadgeStyle = "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
          } else if (company.tier === "Global Capability Center (GCC)") {
            tierBadgeStyle = "bg-amber-500/10 text-amber-300 border-amber-500/20";
          }

          return (
            <div
              key={company.id}
              className="rounded-xl border transition-all duration-200 bg-[var(--surface-1)] border-[var(--border)] hover:border-purple-500/40 p-3.5 sm:p-4 space-y-3 shadow-xs flex flex-col justify-between"
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
                    <Layers size={13} className="text-purple-400 shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] mr-1">
                        System Design Archetype:
                      </span>
                      <span className="font-semibold text-[var(--foreground)] text-[11px] sm:text-xs">
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
                    <TrendingUp size={10} className="text-emerald-400" />
                    <span>Senior Data Engineer</span>
                  </div>
                  <div className="font-bold text-emerald-400 font-mono text-[11px] sm:text-xs">
                    {company.seniorDeSalary}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-0.5">
                  <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold flex items-center gap-1">
                    <Briefcase size={10} className="text-purple-400" />
                    <span>Principal Architect</span>
                  </div>
                  <div className="font-bold text-purple-400 font-mono text-[11px] sm:text-xs">
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
                  <Sparkles size={12} className="text-purple-400 shrink-0" />
                  <span>Key Architectural Interview Topics:</span>
                </div>
                <ul className="space-y-1 text-[var(--muted-foreground)] pl-1 text-[11px] sm:text-xs">
                  {company.interviewFocus.map((focus, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-purple-400 font-bold shrink-0">•</span>
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Production Scale Challenge */}
              <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[11px] leading-relaxed text-[var(--muted-foreground)]">
                <span className="font-bold text-[var(--foreground)]">Scale Challenge: </span>
                {company.keyChallenges}
              </div>

              {/* Real System Design Prompts (Interactive Accordion) */}
              {company.sampleQuestions && company.sampleQuestions.length > 0 && (
                <div className="pt-1">
                  <button
                    onClick={() => toggleExpand(company.id)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 text-purple-300 text-xs font-semibold transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <HelpCircle size={13} className="text-purple-400" />
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
                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                                Scenario Prompt #{qIdx + 1}
                              </span>
                              <button
                                onClick={() => handleCopyPrompt(copyKey, prompt)}
                                className="flex items-center gap-1 text-[10px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
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
                            <p className="text-[11px] sm:text-xs text-[var(--foreground)] leading-relaxed italic">
                              &ldquo;{prompt}&rdquo;
                            </p>
                          </div>
                        );
                      })}

                      <div className="pt-1 flex items-center justify-end">
                        <Link
                          href={`/architecture?category=${encodeURIComponent("Databricks Lakehouse Architecture")}`}
                          className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium"
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
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Load More Companies (+{ITEMS_PER_PAGE})
            </button>
            <button
              onClick={() => setVisibleCount(filteredCompanies.length)}
              className="px-4 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--foreground)] border border-[var(--border)] text-xs font-semibold transition-all"
            >
              Show All ({filteredCompanies.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
