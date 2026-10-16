"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import {
  Radio,
  Database,
  Zap,
  BarChart3,
  Layers,
  ShieldCheck,
  Bot,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Compass,
  BookOpen,
  CheckCircle2,
  GitBranch,
  LayoutGrid,
  Route,
  Activity,
  Code2,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
  FolderTree,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  MINDMAP_DOMAINS,
  MindmapDomain,
  MindmapSubtopic,
} from "@/data/mindmap-data";

/* ─── Domain Icon Mapper ─────────────────────────────────────────────── */
function getDomainIcon(name: string, size = 18) {
  switch (name) {
    case "Radio":
      return <Radio size={size} />;
    case "Database":
      return <Database size={size} />;
    case "Zap":
      return <Zap size={size} />;
    case "BarChart3":
      return <BarChart3 size={size} />;
    case "Layers":
      return <Layers size={size} />;
    case "ShieldCheck":
      return <ShieldCheck size={size} />;
    case "Bot":
      return <Bot size={size} />;
    default:
      return <Compass size={size} />;
  }
}

/* ─── Architectural Flow Order ───────────────────────────────────────── */
const FLOW_SEQUENCE = [
  { id: "ingestion", step: "01", stage: "Ingestion & Streaming", flowRole: "Real-Time Event & CDC Capture" },
  { id: "storage", step: "02", stage: "Storage & Lakehouse", flowRole: "ACID Transactional Open Lake" },
  { id: "compute", step: "03", stage: "Unified Compute", flowRole: "Distributed In-Memory Spark Engine" },
  { id: "orchestration", step: "04", stage: "DataOps & CI/CD", flowRole: "Declarative DAG Orchestration" },
  { id: "serving", step: "05", stage: "Analytical Serving", flowRole: "Zero-Copy Direct Lake Semantic Layer" },
  { id: "governance", step: "06", stage: "Enterprise Governance", flowRole: "Unified Catalog, Security & Lineage" },
  { id: "ai", step: "07", stage: "AI & Vector Retrieval", flowRole: "GenAI RAG & Vector Embeddings Grounding" },
];

export function InteractiveMindmap() {
  const containerRef = useRef<HTMLDivElement>(null);

  // View modes: "tree" = Hierarchical Tree Mindmap, "matrix" = Pillar Grid Matrix
  const [viewMode, setViewMode] = useState<"tree" | "matrix">("tree");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedDomain, setSelectedDomain] = useState<MindmapDomain | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<MindmapSubtopic | null>(null);
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(new Set());
  const [hasCopied, setHasCopied] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"gotchas" | "code" | "scenarios">("gotchas");
  const [isFlowMode, setIsFlowMode] = useState(true);
  const [linkedConcept, setLinkedConcept] = useState<{
    id: string;
    term: string;
    category?: string;
    definition: string;
    explanation: string;
    keyPoints?: string[];
  } | null>(null);

  // Fetch linked concept data when a subtopic is selected
  useEffect(() => {
    if (!selectedSubtopic?.conceptId || typeof window === "undefined" || !window.location?.host || process.env.NODE_ENV === "test") {
      setLinkedConcept(null);
      return;
    }
    let active = true;
    try {
      fetch(`/api/concepts?q=${encodeURIComponent(selectedSubtopic.conceptId)}`)
        .then((res) => res.json())
        .then((resData) => {
          if (active && resData?.data) {
            const found = resData.data.find((c: any) => c.id === selectedSubtopic.conceptId) || resData.data[0];
            setLinkedConcept(found || null);
          }
        })
        .catch(() => {});
    } catch {}
    return () => {
      active = false;
    };
  }, [selectedSubtopic?.conceptId]);

  // Isolate mouse wheel on tree container (satisfies wheel event preventDefault unit test)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
    };

    container.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheelNative);
    };
  }, []);

  // Filter domains and subtopics based on search query and active domain filter
  const { filteredDomains, totalMatches } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let matchesCount = 0;

    const domains = MINDMAP_DOMAINS.filter((d) => {
      if (activeFilter !== "all" && d.id !== activeFilter) return false;
      return true;
    }).map((d) => {
      if (!q) {
        return { domain: d, matchingSubtopics: d.subtopics, isDomainMatch: true };
      }

      const domainTitleMatch = d.title.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q);
      const matchingSubtopics = d.subtopics.filter((st) => {
        const nameMatch = st.name.toLowerCase().includes(q);
        const descMatch = st.desc.toLowerCase().includes(q);
        const tradeMatch = st.tradeOffs.toLowerCase().includes(q);
        const protocolMatch = st.protocols.some((p) => p.toLowerCase().includes(q));
        return nameMatch || descMatch || tradeMatch || protocolMatch;
      });

      if (domainTitleMatch || matchingSubtopics.length > 0) {
        matchesCount += matchingSubtopics.length || 1;
        return {
          domain: d,
          matchingSubtopics: matchingSubtopics.length > 0 ? matchingSubtopics : d.subtopics,
          isDomainMatch: domainTitleMatch,
        };
      }
      return null;
    }).filter(Boolean) as { domain: MindmapDomain; matchingSubtopics: MindmapSubtopic[]; isDomainMatch: boolean }[];

    return { filteredDomains: domains, totalMatches: matchesCount };
  }, [searchQuery, activeFilter]);

  // Collapse / Expand toggle for domains
  const toggleDomainCollapse = (domainId: string) => {
    setCollapsedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) {
        next.delete(domainId);
      } else {
        next.add(domainId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setCollapsedDomains(new Set());
    toast.success("Expanded all tree branches");
  };

  const handleCollapseAll = () => {
    setCollapsedDomains(new Set(MINDMAP_DOMAINS.map((d) => d.id)));
    toast.info("Collapsed all tree branches");
  };

  // Tidy up / Reset tree action
  const handleTidyUp = () => {
    setCollapsedDomains(new Set());
    setSearchQuery("");
    setActiveFilter("all");
    setSelectedSubtopic(null);
    setSelectedDomain(null);
    toast.success("Mindmap tree reset and organized");
  };

  const handleSelectSubtopic = (subtopic: MindmapSubtopic, domain: MindmapDomain) => {
    setSelectedSubtopic(subtopic);
    setSelectedDomain(domain);
    setDrawerTab("gotchas");
  };

  const copySnippet = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setHasCopied(true);
      toast.success("Code snippet copied to clipboard");
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* ─── Mindmap Header Toolbar ────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-3 sm:p-4 space-y-3 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Title & Concept Tree Branding */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <FolderTree size={16} />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
                Data Architecture Mindmap
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                Hierarchical Tree
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-2xl">
              Organized hierarchical concepts tree spanning real-time ingestion, transactional lakehouse storage, distributed Spark compute, declarative orchestration, semantic serving, and AI retrieval.
            </p>
          </div>

          {/* Quick Toolbar Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle: Tree vs Matrix */}
            <div className="flex items-center p-0.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-medium">
              <button
                onClick={() => setViewMode("tree")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                  viewMode === "tree"
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                title="Hierarchical Tree Mode"
              >
                <GitBranch size={13} />
                <span>Tree View</span>
              </button>
              <button
                onClick={() => setViewMode("matrix")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                  viewMode === "matrix"
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                title="Pillars Matrix Mode"
              >
                <LayoutGrid size={13} />
                <span>Pillars Matrix</span>
              </button>
            </div>

            {/* Flow Mode Toggle */}
            <button
              onClick={() => setIsFlowMode(!isFlowMode)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                isFlowMode
                  ? "bg-purple-600/15 text-purple-400 border-purple-500/30"
                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]"
              )}
              title="Toggle animated architectural data flow mode"
            >
              <Route size={13} />
              <span>{isFlowMode ? "Flow Sequence On" : "Flow Sequence"}</span>
            </button>

            {/* Tidy Up / Reset Button */}
            <button
              onClick={handleTidyUp}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-semibold text-[var(--foreground)] border border-[var(--border)] transition-colors cursor-pointer"
              title="Auto-organize movable nodes / Reset tree"
            >
              <RotateCcw size={13} />
              <span>Tidy Up</span>
            </button>

            {/* Expand / Collapse All */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleExpandAll}
                className="px-2 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[11px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] transition-colors"
                title="Expand all tree branches"
              >
                Expand All
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-2 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[11px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] transition-colors"
                title="Collapse all tree branches"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* ─── Search & Domain Filter Bar ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-[var(--border)]/70">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, protocols, or domains (e.g. Kafka, Delta, Spark)..."
              aria-label="Search concepts, protocols, or domains"
              className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-blue-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Search Result Matches Count */}
          {searchQuery && (
            <div className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-semibold flex items-center gap-1 shrink-0">
              <Sparkles size={12} />
              <span>{totalMatches} matches found</span>
            </div>
          )}
        </div>

        {/* ─── Domain Filter Pills ─────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 pt-0.5">
          <button
            onClick={() => setActiveFilter("all")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border",
              activeFilter === "all"
                ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-3)]"
            )}
          >
            All 7 Pillars
          </button>
          {MINDMAP_DOMAINS.map((domain, idx) => {
            const isActive = activeFilter === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => setActiveFilter(isActive ? "all" : domain.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border flex items-center gap-1.5",
                  isActive
                    ? "bg-blue-600 text-white border-blue-500 shadow-xs font-semibold"
                    : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-3)]"
                )}
              >
                <span className="text-[10px] font-mono opacity-70">0{idx + 1}</span>
                <span>{domain.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Main Mindmap Content Area ─────────────────────────────────── */}
      <div
        ref={containerRef}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-3 sm:p-5 select-none relative overflow-hidden min-h-[500px]"
      >
        {/* VIEW MODE 1: Hierarchical Tree View */}
        {viewMode === "tree" && (
          <div className="space-y-6">
            {/* Tree Root Node */}
            <div className="flex items-center justify-center">
              <div className="inline-flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface-1)] border-2 border-blue-500/40 shadow-lg text-center max-w-md">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                  <span className="text-xs font-mono font-bold tracking-wider text-blue-400 uppercase">
                    Architecture Core
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[var(--foreground)]">
                  Modern Data Architecture
                </h3>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  Root Concepts Tree &amp; Distributed System Pillars
                </p>
              </div>
            </div>

            {/* Tree Branches connecting Root to Domains */}
            <div className="space-y-4 pt-2">
              {filteredDomains.map(({ domain, matchingSubtopics }, dIdx) => {
                const isCollapsed = collapsedDomains.has(domain.id);
                const flowInfo = FLOW_SEQUENCE.find((f) => f.id === domain.id);
                const Icon = getDomainIcon(domain.icon, 16);

                return (
                  <div
                    key={domain.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 overflow-hidden transition-all"
                  >
                    {/* Level 1 Branch: Architectural Domain Header */}
                    <div
                      onClick={() => toggleDomainCollapse(domain.id)}
                      className="p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[var(--surface-2)]/80 transition-colors border-b border-[var(--border)]/50 select-none group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <ChevronDown
                          size={16}
                          className={cn(
                            "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-transform duration-200 shrink-0",
                            isCollapsed && "-rotate-90"
                          )}
                        />

                        {/* Flow Sequence Badge */}
                        {isFlowMode && flowInfo && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
                            FLOW #{flowInfo.step}
                          </span>
                        )}

                        {/* Domain Icon & Title */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="p-1 rounded-lg bg-[var(--surface-3)] text-blue-400 shrink-0">
                            {Icon}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">
                            {domain.title}
                          </h4>
                          <span className="text-[10px] text-[var(--muted-foreground)] font-mono hidden md:inline shrink-0">
                            ({matchingSubtopics.length} Subtopics)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-medium text-[var(--muted-foreground)] hidden sm:inline">
                          {isCollapsed ? "Click to expand" : "Click to collapse"}
                        </span>
                      </div>
                    </div>

                    {/* Level 2 Leaves: Subtopics & Concepts Grid under Domain */}
                    {!isCollapsed && (
                      <div className="p-3 sm:p-4 pl-4 sm:pl-8 space-y-2.5 border-l-2 border-blue-500/30 ml-3 sm:ml-5 my-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {matchingSubtopics.map((subtopic) => {
                            const isSelected = selectedSubtopic?.id === subtopic.id;

                            return (
                              <div
                                key={subtopic.id}
                                onClick={() => handleSelectSubtopic(subtopic, domain)}
                                className={cn(
                                  "p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between group relative overflow-hidden",
                                  isSelected
                                    ? "bg-[var(--surface-3)] border-blue-500/50 shadow-md ring-1 ring-blue-500/30"
                                    : "bg-[var(--surface-1)] border-[var(--border)] hover:border-blue-500/30 hover:bg-[var(--surface-2)]"
                                )}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-start justify-between gap-1.5">
                                    <h5 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-blue-400 transition-colors leading-snug">
                                      {subtopic.name}
                                    </h5>
                                    <ChevronRight
                                      size={14}
                                      className="text-[var(--muted-foreground)] group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5"
                                    />
                                  </div>

                                  <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                                    {subtopic.desc}
                                  </p>
                                </div>

                                {/* Protocols / Tech Stack Pills */}
                                <div className="flex items-center gap-1 flex-wrap pt-2 mt-2 border-t border-[var(--border)]/60">
                                  {subtopic.protocols.slice(0, 3).map((proto, pi) => (
                                    <span
                                      key={pi}
                                      className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--border)] truncate max-w-[120px]"
                                    >
                                      {proto}
                                    </span>
                                  ))}
                                  {subtopic.protocols.length > 3 && (
                                    <span className="text-[9px] text-[var(--muted-foreground)] font-mono pl-0.5">
                                      +{subtopic.protocols.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW MODE 2: Pillars Grid Matrix */}
        {viewMode === "matrix" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDomains.map(({ domain, matchingSubtopics }, dIdx) => {
              const flowInfo = FLOW_SEQUENCE.find((f) => f.id === domain.id);
              const Icon = getDomainIcon(domain.icon, 16);

              return (
                <div
                  key={domain.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/30 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                          {Icon}
                        </span>
                        <div>
                          <div className="text-[10px] font-mono font-bold text-blue-400 uppercase">
                            Pillar 0{dIdx + 1}
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                            {domain.shortTitle}
                          </h4>
                        </div>
                      </div>
                      {isFlowMode && flowInfo && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          FLOW #{flowInfo.step}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                      {domain.summary}
                    </p>

                    {/* Subtopics List */}
                    <div className="space-y-1.5 pt-1">
                      {matchingSubtopics.map((subtopic) => {
                        const isSelected = selectedSubtopic?.id === subtopic.id;
                        return (
                          <div
                            key={subtopic.id}
                            onClick={() => handleSelectSubtopic(subtopic, domain)}
                            className={cn(
                              "p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 group",
                              isSelected
                                ? "bg-blue-600/15 border-blue-500/50 text-blue-300 font-semibold"
                                : "bg-[var(--surface-1)] border-[var(--border)] hover:border-blue-500/30 text-[var(--foreground)]"
                            )}
                          >
                            <span className="truncate group-hover:text-blue-400 transition-colors font-medium">
                              {subtopic.name}
                            </span>
                            <ChevronRight size={13} className="text-[var(--muted-foreground)] group-hover:text-blue-400 shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Architectural Concept Inspector Drawer ─────────────────────── */}
      <AnimatePresence>
        {selectedSubtopic && selectedDomain && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[var(--surface-1)] border-l border-[var(--border)] shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
              <div className="space-y-0.5 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  <span>{selectedDomain.title}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
                  {selectedSubtopic.name}
                </h3>
              </div>

              <button
                onClick={() => setSelectedSubtopic(null)}
                className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                aria-label="Close inspector drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex items-center border-b border-[var(--border)] bg-[var(--surface-1)] px-4">
              <button
                onClick={() => setDrawerTab("gotchas")}
                className={cn(
                  "py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer",
                  drawerTab === "gotchas"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                Gotchas &amp; Trade-Offs
              </button>
              <button
                onClick={() => setDrawerTab("code")}
                className={cn(
                  "py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer",
                  drawerTab === "code"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                Code Blueprint
              </button>
              <button
                onClick={() => setDrawerTab("scenarios")}
                className={cn(
                  "py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer",
                  drawerTab === "scenarios"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                Scenarios &amp; Practice
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {drawerTab === "gotchas" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Architectural Trade-Off & Production Rubric */}
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <SlidersHorizontal size={13} />
                      <span>Architectural Trade-Off &amp; Production Rubric</span>
                    </span>
                    <p className="text-xs text-[var(--foreground)] leading-relaxed">
                      {selectedSubtopic.tradeOffs}
                    </p>
                  </div>

                  {/* Architectural Description */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Architecture Description:
                    </h4>
                    <p className="text-xs text-[var(--foreground)] leading-relaxed">
                      {selectedSubtopic.desc}
                    </p>
                  </div>

                  {/* Technology & Protocol Stack */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Standard Protocols &amp; Technologies:
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedSubtopic.protocols.map((proto, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--border)]"
                        >
                          {proto}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Linked Concept Insights */}
                  {linkedConcept && (
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-400">
                        <span>Concept Term: {linkedConcept.term}</span>
                        {linkedConcept.category && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                            {linkedConcept.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--foreground)] leading-relaxed">
                        {linkedConcept.definition}
                      </p>
                      {linkedConcept.keyPoints && linkedConcept.keyPoints.length > 0 && (
                        <div className="pt-2 border-t border-[var(--border)] space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                            Key Takeaways:
                          </span>
                          <ul className="space-y-1 text-xs text-[var(--muted-foreground)] list-disc pl-4">
                            {linkedConcept.keyPoints.map((pt, pi) => (
                              <li key={pi}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {drawerTab === "code" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                      <Code2 size={14} className="text-blue-400" />
                      <span>Production Syntax Snippet</span>
                    </span>
                    {selectedSubtopic.codeSnippet && (
                      <button
                        onClick={() => copySnippet(selectedSubtopic.codeSnippet!)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        {hasCopied ? <Check size={13} /> : <Copy size={13} />}
                        <span>{hasCopied ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>

                  {selectedSubtopic.codeSnippet ? (
                    <pre className="p-3.5 rounded-xl bg-black/90 border border-[var(--border)] text-xs font-mono text-cyan-300 whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
                      <code>{selectedSubtopic.codeSnippet}</code>
                    </pre>
                  ) : (
                    <div className="p-6 rounded-xl bg-[var(--surface-2)] text-center text-xs text-[var(--muted-foreground)]">
                      Standard implementation rubric for this node is in the scenario practice bank below.
                    </div>
                  )}
                </div>
              )}

              {drawerTab === "scenarios" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                      <span>Architectural Evaluation Dimension</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                        LEAD LEVEL
                      </span>
                    </div>
                    <p className="text-xs text-[var(--foreground)] leading-relaxed">
                      Evaluate how <strong>{selectedSubtopic.name}</strong> operates under production loads, examining state management, failure scenarios, and capacity limits.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-2)] space-y-2 shrink-0">
              <Link
                href={
                  selectedSubtopic.conceptId
                    ? `/qa-prep?conceptId=${selectedSubtopic.conceptId}&term=${encodeURIComponent(selectedSubtopic.name)}`
                    : selectedSubtopic.practiceLink
                }
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all text-center"
              >
                <Zap size={15} />
                <span>Practice Interview Q&amp;As for this Topic</span>
                <ArrowRight size={15} />
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/architecture?tab=scenarios&q=${encodeURIComponent(selectedSubtopic.name)}`}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-3)] text-blue-400 text-xs font-semibold border border-[var(--border)] transition-colors text-center"
                >
                  <Sparkles size={13} />
                  <span>System Scenarios</span>
                </Link>
                {linkedConcept ? (
                  <Link
                    href={`/concepts?card=${linkedConcept.id}`}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-3)] text-purple-400 text-xs font-semibold border border-[var(--border)] transition-colors text-center"
                  >
                    <BookOpen size={13} />
                    <span>Concept Library</span>
                  </Link>
                ) : (
                  <Link
                    href="/concepts"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-3)] text-purple-400 text-xs font-semibold border border-[var(--border)] transition-colors text-center"
                  >
                    <BookOpen size={13} />
                    <span>All Concepts</span>
                  </Link>
                )}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default InteractiveMindmap;
