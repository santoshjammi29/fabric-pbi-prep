"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DataOpsDataset,
  DataOpsConnectivityItem,
  CicdAlternativeItem,
  ProjectLifecycleStage,
} from "@/types/data";
import { cn } from "@/lib/utils";
import {
  Network,
  GitBranch,
  Layers,
  Workflow,
  Search,
  Check,
  Copy,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  FileCode2,
  ExternalLink,
  Zap,
  Clock,
  DollarSign,
  ArrowRight,
  Database,
  KeyRound,
  Server,
  Terminal,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface DataOpsClientProps {
  initialData: DataOpsDataset;
}

type TabType = "connectivity" | "cicd" | "lifecycle" | "diagram";

export function DataOpsClient({ initialData }: DataOpsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = (searchParams.get("tab") as TabType) || "connectivity";
  const [currentTab, setCurrentTab] = useState<TabType>(initialTab);

  useEffect(() => {
    const paramTab = searchParams.get("tab") as TabType;
    if (paramTab && ["connectivity", "cicd", "lifecycle", "diagram"].includes(paramTab)) {
      setCurrentTab(paramTab);
    }
  }, [searchParams]);

  const setTab = (tab: TabType) => {
    setCurrentTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/dataops?${params.toString()}`, { scroll: false });
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToolFilter, setSelectedToolFilter] = useState<string>("ALL");
  const [selectedCicdCategory, setSelectedCicdCategory] = useState<string>("ALL");
  const [activeStageNumber, setActiveStageNumber] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    "adf-databricks-msi": true,
    "dab-vs-repos": true,
  });

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Connectivity Items
  const filteredConnectivity = useMemo(() => {
    return initialData.connectivity.filter((item) => {
      const matchesTool =
        selectedToolFilter === "ALL" ||
        item.sourceTool.toLowerCase().includes(selectedToolFilter.toLowerCase()) ||
        item.targetTool.toLowerCase().includes(selectedToolFilter.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase() === selectedToolFilter.toLowerCase());

      const matchesSearch =
        !searchQuery ||
        item.sourceTool.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.targetTool.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.configSnippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTool && matchesSearch;
    });
  }, [initialData.connectivity, selectedToolFilter, searchQuery]);

  // Filtered CI/CD Alternatives
  const filteredCicd = useMemo(() => {
    return initialData.cicdAlternatives.filter((item) => {
      const matchesCategory =
        selectedCicdCategory === "ALL" || item.category === selectedCicdCategory;

      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.recommendedApproach.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tradeOffSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.interviewSoundbite.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [initialData.cicdAlternatives, selectedCicdCategory, searchQuery]);

  // Active Lifecycle Stage
  const activeStage = useMemo(() => {
    return (
      initialData.lifecycleStages.find((s) => s.stageNumber === activeStageNumber) ||
      initialData.lifecycleStages[0]
    );
  }, [initialData.lifecycleStages, activeStageNumber]);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-5">
      {/* Compact Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-4 shadow-xs isolate mb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1 max-w-4xl 2xl:max-w-6xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-400">
              <Workflow size={11} />
              <span>Enterprise DataOps &amp; Lifecycle Playbook · Big Data Architect Edition</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] break-words">
              Tool Connectivity, CI/CD Alternatives &amp; E2E Lifecycle
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
              Production-grade configs for ADF, Databricks, Airflow, dbt, SQL, and DevOps.
              Defend end-to-end big data architectures with battle-tested talking points and code templates.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-sm sm:text-base font-bold text-blue-400 leading-none">{initialData.connectivity.length}</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium mt-0.5">Configs</div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-sm sm:text-base font-bold text-purple-400 leading-none">{initialData.cicdAlternatives.length}</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium mt-0.5">CI/CD Paths</div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-sm sm:text-base font-bold text-emerald-400 leading-none">{initialData.lifecycleStages.length}</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium mt-0.5">Stages</div>
            </div>
          </div>
        </div>
      </div>

      {/* DOUBLE-LINE TOP SLICERS & FILTERS DECK */}
      <div className="space-y-2 p-2.5 sm:p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs mb-3">
        {/* LINE 1: PRIMARY TAB NAVIGATION - Styled after media_1792228927376_5ece2e88.png */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] max-w-fit shadow-xs pb-0.5">
          <button
            onClick={() => setTab("connectivity")}
            className={cn(
              "flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 whitespace-nowrap cursor-pointer",
              currentTab === "connectivity"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <Network size={14} />
            <span>1. Tool Connectivity &amp; Secrets</span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
              currentTab === "connectivity" ? "bg-white/20 text-white" : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
            )}>
              {initialData.connectivity.length}
            </span>
          </button>

          <button
            onClick={() => setTab("cicd")}
            className={cn(
              "flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 whitespace-nowrap cursor-pointer",
              currentTab === "cicd"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <GitBranch size={14} />
            <span>2. CI/CD Alternatives &amp; Pipelines</span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
              currentTab === "cicd" ? "bg-white/20 text-white" : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
            )}>
              {initialData.cicdAlternatives.length}
            </span>
          </button>

          <button
            onClick={() => setTab("lifecycle")}
            className={cn(
              "flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 whitespace-nowrap cursor-pointer",
              currentTab === "lifecycle"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <Workflow size={14} />
            <span>3. End-to-End Project Lifecycle</span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
              currentTab === "lifecycle" ? "bg-white/20 text-white" : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
            )}>
              {initialData.lifecycleStages.length} Stages
            </span>
          </button>

          <button
            onClick={() => setTab("diagram")}
            className={cn(
              "flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 whitespace-nowrap cursor-pointer",
              currentTab === "diagram"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <Layers size={14} />
            <span>4. Interactive Architecture Diagram</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Whiteboard
            </span>
          </button>
        </div>

        {/* LINE 2: SEARCH INPUT + TAB-SPECIFIC FILTER CHIPS + RESULT COUNTER */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-[var(--border)]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                currentTab === "connectivity"
                  ? "Search connectivity (e.g. Managed Identity, OAuth M2M, Key Vault, profiles.yml)..."
                  : currentTab === "cicd"
                  ? "Search CI/CD patterns (e.g. Databricks Asset Bundles, Git-Sync, Slim CI)..."
                  : "Search lifecycle stages, deliverables, failure modes, or interview scripts..."
              }
              className="w-full pl-9 pr-12 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
            {currentTab === "connectivity" && (
              <span className="text-[11px] text-[var(--muted-foreground)] whitespace-nowrap pl-1">
                <strong className="text-[var(--foreground)]">{filteredConnectivity.length}</strong> of {initialData.connectivity.length} configs
              </span>
            )}

            {currentTab === "cicd" && (
              <span className="text-[11px] text-[var(--muted-foreground)] whitespace-nowrap pl-1">
                <strong className="text-[var(--foreground)]">{filteredCicd.length}</strong> of {initialData.cicdAlternatives.length} patterns
              </span>
            )}

            {currentTab === "lifecycle" && (
              <span className="text-[11px] text-[var(--muted-foreground)] whitespace-nowrap pl-1">
                Stage <strong className="text-[var(--foreground)]">{activeStageNumber}</strong> of {initialData.lifecycleStages.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TOOL CONNECTIVITY & CONFIGURATIONS */}
      {/* ========================================================================= */}
      {currentTab === "connectivity" && (
        <div className="space-y-3">


          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-3">
            {filteredConnectivity.map((item) => {
              const isOpen = expandedCards[item.id] ?? false;
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs transition-all duration-150 overflow-hidden"
                >
                  {/* Card Header */}
                  <div
                    onClick={() => toggleCard(item.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:px-4 cursor-pointer hover:bg-[var(--surface-2)] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                        <Network size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-[var(--foreground)] break-words">
                            {item.sourceTool} <span className="text-blue-400">⟷</span> {item.targetTool}
                          </h3>
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                              item.authMethod === "OAuth M2M" || item.authMethod === "Workload Identity (OIDC)"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : item.authMethod === "Managed Identity"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            )}
                          >
                            {item.authMethod}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--muted-foreground)] border border-[var(--border)]">
                            {item.securityLevel}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 break-words">
                          {item.connectionProtocol}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span className="text-[11px] text-[var(--muted-foreground)] hidden sm:inline">
                        {isOpen ? "Collapse" : "Inspect Spec"}
                      </span>
                      <ChevronDown
                        size={16}
                        className={cn(
                          "text-[var(--muted-foreground)] transition-transform duration-150",
                          isOpen && "rotate-180"
                        )}
                      />
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isOpen && (
                    <div className="p-3 sm:p-4 pt-1 sm:pt-2 border-t border-[var(--border)] bg-[var(--surface-1)] space-y-3.5">
                      <p className="text-xs text-[var(--foreground)] leading-relaxed break-words">
                        {item.summary}
                      </p>

                      {/* Code Snippet Box */}
                      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-3)] overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)] bg-[var(--surface-2)] text-[11px]">
                          <span className="font-mono text-[var(--muted-foreground)] flex items-center gap-1.5">
                            <FileCode2 size={13} className="text-blue-400" />
                            {item.configPathOrKey}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(item.configSnippet, item.id);
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--surface-3)] hover:bg-[var(--surface-1)] text-[var(--foreground)] border border-[var(--border)] transition-colors"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check size={11} className="text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 text-[11px] font-mono leading-relaxed overflow-x-auto text-[var(--foreground)] scrollbar-thin">
                          <code>{item.configSnippet}</code>
                        </pre>
                      </div>

                      {/* 2-Column Specs: Setup Steps vs Security & Gotchas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Setup Steps */}
                        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-1.5">
                          <div className="font-semibold text-[var(--foreground)] flex items-center gap-1.5 text-xs">
                            <ShieldCheck size={14} className="text-emerald-400" />
                            Production Setup Sequence
                          </div>
                          <ul className="space-y-1 text-[11px] text-[var(--muted-foreground)] list-disc pl-4">
                            {item.setupSteps.map((step, idx) => (
                              <li key={idx} className="leading-snug">
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Security Pitfalls & Key Vault */}
                        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-2">
                          <div>
                            <div className="font-semibold text-[var(--foreground)] flex items-center gap-1.5 text-xs">
                              <KeyRound size={14} className="text-purple-400" />
                              Key Vault & Secret Management
                            </div>
                            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                              {item.keyVaultIntegration}
                            </p>
                          </div>

                          <div className="pt-1.5 border-t border-[var(--border)]">
                            <div className="font-semibold text-rose-400 flex items-center gap-1.5 text-xs">
                              <AlertTriangle size={14} />
                              Common Traps & Anti-Patterns
                            </div>
                            <ul className="space-y-1 text-[11px] text-[var(--muted-foreground)] list-disc pl-4 mt-1">
                              {item.securityPitfalls.map((pitfall, idx) => (
                                <li key={idx} className="leading-snug">
                                  {pitfall}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Architectural Interview Defense Tip */}
                      <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5 text-xs text-blue-300 flex items-start gap-2.5">
                        <Lightbulb size={16} className="text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-blue-200 uppercase text-[10px] tracking-wider block">
                            Architectural Interview Defense Soundbite
                          </span>
                          <p className="text-xs text-[var(--foreground)] mt-0.5 leading-relaxed italic">
                            &ldquo;{item.interviewDefenseTip}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CI/CD ALTERNATIVES & BLUEPRINTS */}
      {/* ========================================================================= */}
      {currentTab === "cicd" && (
        <div className="space-y-3">


          {/* Alternatives Cards */}
          <div className="grid grid-cols-1 gap-3.5">
            {filteredCicd.map((item) => {
              const isOpen = expandedCards[item.id] ?? false;
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs transition-all duration-150 overflow-hidden"
                >
                  {/* Card Header */}
                  <div
                    onClick={() => toggleCard(item.id)}
                    className="p-3 sm:p-4 cursor-pointer hover:bg-[var(--surface-2)] transition-colors select-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                          <GitBranch size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-[var(--foreground)] break-words">
                              {item.name}
                            </h3>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-0.5">
                            <span className="text-emerald-400 font-medium">
                              Target: {item.recommendedApproach}
                            </span>
                            <span>vs</span>
                            <span className="text-[var(--muted-foreground)] line-through">
                              {item.legacyOrAlternative}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Performance & Cost Pill Indicators */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 text-[10px]">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-3)] text-blue-400 border border-[var(--border)]">
                          <Clock size={11} />
                          {item.speedRating}
                        </span>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-3)] text-emerald-400 border border-[var(--border)]">
                          <DollarSign size={11} />
                          {item.costEfficiency}
                        </span>
                        <ChevronDown
                          size={16}
                          className={cn(
                            "text-[var(--muted-foreground)] transition-transform duration-150 ml-1",
                            isOpen && "rotate-180"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isOpen && (
                    <div className="p-3 sm:p-4 pt-1 sm:pt-2 border-t border-[var(--border)] bg-[var(--surface-1)] space-y-3.5">
                      <p className="text-xs text-[var(--foreground)] leading-relaxed break-words">
                        {item.tradeOffSummary}
                      </p>

                      {/* Side-by-side Pros & Cons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
                          <div className="font-semibold text-emerald-400 flex items-center gap-1.5 text-xs">
                            <CheckCircle2 size={14} />
                            Recommended Approach Advantages
                          </div>
                          <ul className="space-y-1 text-[11px] text-[var(--muted-foreground)] list-disc pl-4">
                            {item.pros.map((pro, idx) => (
                              <li key={idx} className="leading-snug text-[var(--foreground)] break-words">
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1.5">
                          <div className="font-semibold text-amber-400 flex items-center gap-1.5 text-xs">
                            <XCircle size={14} />
                            Trade-Offs & Complexity
                          </div>
                          <ul className="space-y-1 text-[11px] text-[var(--muted-foreground)] list-disc pl-4">
                            {item.cons.map((con, idx) => (
                              <li key={idx} className="leading-snug text-[var(--foreground)] break-words">
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Workflow Code Block */}
                      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-3)] overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)] bg-[var(--surface-2)] text-[11px]">
                          <span className="font-mono text-[var(--muted-foreground)] flex items-center gap-1.5">
                            <Terminal size={13} className="text-purple-400" />
                            Production CI/CD Pipeline Implementation
                          </span>
                          <button
                            onClick={() => handleCopy(item.workflowYaml, item.id)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--surface-3)] hover:bg-[var(--surface-1)] text-[var(--foreground)] border border-[var(--border)] transition-colors"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check size={11} className="text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Copy Workflow</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 text-[11px] font-mono leading-relaxed overflow-x-auto text-[var(--foreground)] scrollbar-thin">
                          <code>{item.workflowYaml}</code>
                        </pre>
                      </div>

                      {/* Architecture Description & Gotchas */}
                      <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-[var(--foreground)] block mb-0.5">
                            Under the Hood Architecture
                          </span>
                          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                            {item.architectureDescription}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[var(--border)]">
                          <span className="font-semibold text-rose-400 flex items-center gap-1.5 text-xs mb-1">
                            <AlertTriangle size={13} />
                            Critical Gotchas to Watch For
                          </span>
                          <ul className="space-y-1 text-[11px] text-[var(--muted-foreground)] list-disc pl-4">
                            {item.keyGotchas.map((gotcha, idx) => (
                              <li key={idx} className="leading-snug">
                                {gotcha}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Interview Soundbite */}
                      <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/5 text-xs text-purple-300 flex items-start gap-2.5">
                        <Lightbulb size={16} className="text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-purple-200 uppercase text-[10px] tracking-wider block">
                            How to Explain in an Architectural Interview
                          </span>
                          <p className="text-xs text-[var(--foreground)] mt-0.5 leading-relaxed italic">
                            {item.interviewSoundbite}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: END-TO-END PROJECT LIFECYCLE PLAYBOOK */}
      {/* ========================================================================= */}
      {currentTab === "lifecycle" && (
        <div className="space-y-4">
          {/* Horizontal Stepper */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {initialData.lifecycleStages.map((stage) => {
              const isActive = stage.stageNumber === activeStageNumber;
              return (
                <button
                  key={stage.stageNumber}
                  onClick={() => setActiveStageNumber(stage.stageNumber)}
                  className={cn(
                    "flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-150 relative",
                    isActive
                      ? "bg-blue-600/10 border-blue-500 text-blue-400 shadow-xs"
                      : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                        isActive
                          ? "bg-blue-500 text-white"
                          : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                      )}
                    >
                      Stage {stage.stageNumber}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      {stage.phase.split("&")[0]}
                    </span>
                  </div>
                  <div className="text-xs font-bold truncate w-full text-[var(--foreground)]">
                    {stage.stageName.split(":")[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Detailed Breakdown */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Stage {activeStage.stageNumber}: {activeStage.phase}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Primary Tools: {activeStage.primaryTools.join(", ")}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] break-words">
                  {activeStage.stageName}
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 break-words">
                  {activeStage.objective}
                </p>
              </div>

              {/* Prev / Next Stage Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  disabled={activeStageNumber === 1}
                  onClick={() => setActiveStageNumber((prev) => Math.max(1, prev - 1))}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--surface-3)]"
                >
                  ← Previous
                </button>
                <button
                  disabled={activeStageNumber === initialData.lifecycleStages.length}
                  onClick={() =>
                    setActiveStageNumber((prev) =>
                      Math.min(initialData.lifecycleStages.length, prev + 1)
                    )
                  }
                  className="px-2.5 py-1 text-xs rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700"
                >
                  Next Stage →
                </button>
              </div>
            </div>

            {/* Stage Deep Dive 3-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Column 1: Key Architectural Decisions */}
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] space-y-2">
                <div className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <Layers size={14} className="text-blue-400" />
                  Key Architectural Decisions
                </div>
                <ul className="space-y-1.5 text-[11px] text-[var(--muted-foreground)] list-disc pl-4">
                  {activeStage.keyArchitecturalDecisions.map((dec, idx) => (
                    <li key={idx} className="leading-snug text-[var(--foreground)] break-words">
                      {dec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Concrete Deliverables & Artifacts */}
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] space-y-2">
                <div className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <FileCode2 size={14} className="text-emerald-400" />
                  Concrete Deliverables & Artifacts
                </div>
                <div className="space-y-2">
                  {activeStage.concreteDeliverables.map((del, idx) => (
                    <div key={idx} className="p-2 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[11px]">
                      <div className="font-semibold text-emerald-400 break-words">{del.name}</div>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 break-words">
                        {del.description}
                      </p>
                      <div className="flex items-center gap-1 flex-wrap mt-1">
                        {del.artifacts.map((art, aIdx) => (
                          <span
                            key={aIdx}
                            className="font-mono text-[9px] px-1 py-0.2 rounded bg-[var(--surface-3)] text-[var(--foreground)] border border-[var(--border)]"
                          >
                            {art}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Gatekeeper Checklist & Failure Modes */}
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] space-y-3">
                <div>
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs mb-1.5">
                    <CheckCircle2 size={14} />
                    Production Exit Criteria / Checklist
                  </div>
                  <ul className="space-y-1 text-[11px] text-[var(--muted-foreground)] list-disc pl-4">
                    {activeStage.gatekeeperChecklist.map((check, idx) => (
                      <li key={idx} className="leading-snug">
                        {check}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-[var(--border)]">
                  <div className="font-bold text-rose-400 flex items-center gap-1.5 text-xs mb-1.5">
                    <AlertTriangle size={14} />
                    Catastrophic Failure Modes
                  </div>
                  <ul className="space-y-1 text-[11px] text-[var(--muted-foreground)] list-disc pl-4">
                    {activeStage.commonFailureModes.map((fail, idx) => (
                      <li key={idx} className="leading-snug">
                        {fail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Interview Script Callout */}
            <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb size={16} className="text-blue-400" />
                <span className="font-bold text-blue-200 uppercase text-[11px] tracking-wider">
                  How to Defend This Stage in an Architectural System Design Interview
                </span>
              </div>
              <p className="text-xs text-[var(--foreground)] leading-relaxed italic pl-6 break-words whitespace-normal">
                &ldquo;{activeStage.interviewExplanationScript}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INTERACTIVE WHITEBOARD ARCHITECTURE DIAGRAM */}
      {/* ========================================================================= */}
      {currentTab === "diagram" && (
        <div className="space-y-4">
          {/* Whiteboard Legend Banner */}
          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--foreground)] uppercase text-[11px] tracking-wider">
                Visual Hierarchy & Semantic Color Legend:
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap text-[11px]">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-xs" />
                <span className="text-[var(--foreground)]">Red: Schedulers & Compute (Airflow, Databricks, Spark)</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-xs" />
                <span className="text-[var(--foreground)]">Blue: Dispatchers & CI/CD (ADF, GitHub Actions)</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-xs" />
                <span className="text-[var(--foreground)]">Yellow: Raw Landing & Sources (ADLS Bronze)</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block shadow-xs" />
                <span className="text-[var(--foreground)]">Purple: Governance & Secrets (Unity Catalog, Key Vault)</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs" />
                <span className="text-[var(--foreground)]">Green: Target Gold Lakehouse & BI (Delta Parquet, Power BI)</span>
              </span>
            </div>
          </div>

          {/* Whiteboard SVG Canvas */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 sm:p-4 overflow-x-auto shadow-inner">
            <div className="min-w-[950px] relative">
              {/* Title & Watermark */}
              <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2 break-words">
                    <Layers size={18} className="text-blue-500" />
                    End-to-End Enterprise Big Data Architecture: Ingestion ➔ Compute ➔ Governance ➔ Serving
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] break-words">
                    Control Flow (Triggers & Dispatches via Dashed Arrows) vs Data Flow (ETL/ELT via Solid Arrows)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <span className="w-6 h-0.5 border-t-2 border-dashed border-blue-400" /> Control Trigger
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-6 h-0.5 bg-emerald-500" /> Data Flow
                  </span>
                </div>
              </div>

              {/* 5-Column Swimlane Diagram */}
              <div className="grid grid-cols-5 gap-4 relative">
                {/* Column 1: Sources & Orchestration Dispatch */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] text-center pb-1 border-b border-[var(--border)]">
                    1. Ingestion & Orchestration
                  </div>

                  {/* Red Card: Airflow */}
                  <div className="p-3 rounded-xl border-2 border-red-500/50 bg-red-500/5 shadow-xs relative">
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                      Master Orchestrator
                    </div>
                    <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                      Apache Airflow
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      Cron DAGs, SLA Monitors, Deferrable Operators
                    </p>
                    <div className="mt-2 text-[9px] font-mono bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">
                      Git-Sync Sidecar (30s)
                    </div>
                  </div>

                  {/* Blue Card: ADF */}
                  <div className="p-3 rounded-xl border-2 border-blue-500/50 bg-blue-500/5 shadow-xs relative">
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                      Batch Dispatcher
                    </div>
                    <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                      Azure Data Factory
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      Managed VNet, Self-Hosted IR, Copy Activity
                    </p>
                    <div className="mt-2 text-[9px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                      Managed Identity (Zero PAT)
                    </div>
                  </div>
                </div>

                {/* Column 2: Storage Landing (Bronze) */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] text-center pb-1 border-b border-[var(--border)]">
                    2. Raw Landing (Bronze)
                  </div>

                  {/* Amber Card: ADLS Bronze */}
                  <div className="p-3 rounded-xl border-2 border-amber-500/50 bg-amber-500/5 shadow-xs relative">
                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                      Immutable Lake
                    </div>
                    <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                      ADLS Gen2 (Bronze)
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      Raw JSON, CSV, CDC events + Ingestion Metadata
                    </p>
                    <div className="mt-2 text-[9px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                      _rescued_data enabled
                    </div>
                  </div>

                  {/* Red Card: Databricks Auto Loader */}
                  <div className="p-3 rounded-xl border-2 border-red-500/50 bg-red-500/5 shadow-xs relative">
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                      Streaming Ingest
                    </div>
                    <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                      Databricks Auto Loader
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      cloudFiles, Incremental Schema Evolution
                    </p>
                  </div>
                </div>

                {/* Column 3: Processing & Quality (Silver) */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] text-center pb-1 border-b border-[var(--border)]">
                    3. Cleansing & Curation (Silver)
                  </div>

                  {/* Red Card: Databricks Spark */}
                  <div className="p-3 rounded-xl border-2 border-red-500/50 bg-red-500/5 shadow-xs relative">
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                      Transformation Engine
                    </div>
                    <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                      Databricks (Photon Engine)
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      PySpark MERGE INTO, Deduplication, DLT Expectations
                    </p>
                    <div className="mt-2 text-[9px] font-mono bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">
                      DABs Deployment (databricks.yml)
                    </div>
                  </div>

                  {/* Purple Card: Data Quality & Tests */}
                  <div className="p-3 rounded-xl border-2 border-purple-500/50 bg-purple-500/5 shadow-xs relative">
                    <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">
                      Quality Gate
                    </div>
                    <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                      dbt Tests & Quarantine
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      Uniqueness, FK integrity, Quarantine routing
                    </p>
                  </div>
                </div>

                {/* Column 4: Governance & Catalog (Unity) */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] text-center pb-1 border-b border-[var(--border)]">
                    4. Governance & Security
                  </div>

                  {/* Purple Card: Unity Catalog */}
                  <div className="p-3 rounded-xl border-2 border-purple-500/50 bg-purple-500/5 shadow-xs relative">
                    <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">
                      Central Metastore
                    </div>
                    <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                      Unity Catalog
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      3-Level Namespace, Column Masking, End-to-End Lineage
                    </p>
                    <div className="mt-2 text-[9px] font-mono bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">
                      dev / staging / prod catalogs
                    </div>
                  </div>

                  {/* Purple Card: Key Vault */}
                  <div className="p-3 rounded-xl border-2 border-purple-500/50 bg-purple-500/5 shadow-xs relative">
                    <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">
                      Secret Management
                    </div>
                    <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                      Azure Key Vault
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      Zero static secrets, OIDC Workload Identity, RBAC
                    </p>
                  </div>
                </div>

                {/* Column 5: Serving & Consumption (Gold) */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] text-center pb-1 border-b border-[var(--border)]">
                    5. Consumption & BI (Gold)
                  </div>

                  {/* Green Card: Delta Lake Gold */}
                  <div className="p-3 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/5 shadow-xs relative">
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      Curated Marts
                    </div>
                    <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                      Gold Delta Tables
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      Kimball Star Schema, Liquid Clustering, V-Order
                    </p>
                    <div className="mt-2 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Time Travel & Deep Clone DR
                    </div>
                  </div>

                  {/* Green Card: Power BI */}
                  <div className="p-3 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/5 shadow-xs relative">
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      Direct Lake BI
                    </div>
                    <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                      Power BI & Fabric
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      Zero-copy memory mapped queries directly over Delta Parquet
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Architectural Callout */}
              <div className="mt-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-[var(--foreground)] block">
                    Enterprise DataOps Golden Rule:
                  </span>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                    Every data movement must be idempotent, every schema change must be versioned in Git,
                    and every credential must leverage short-lived tokens via Microsoft Entra ID or OIDC.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setTab("cicd")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                  >
                    <span>View CI/CD YAML Pipelines</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
