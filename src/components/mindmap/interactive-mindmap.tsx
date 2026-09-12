"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Database,
  Zap,
  BarChart3,
  Layers,
  ShieldCheck,
  Bot,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  MINDMAP_DOMAINS,
  MindmapDomain,
  MindmapSubtopic,
} from "@/data/mindmap-data";

/* ─── Icon Mapper ────────────────────────────────────────────────────── */
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

/* ─── Layout Geometry Constants ───────────────────────────────────────── */
const CANVAS_WIDTH = 2600;
const CANVAS_HEIGHT = 1600;
const ROOT_X = 1300;
const ROOT_Y = 800;

// Branch horizontal offsets from root
const LEFT_BRANCH_X = 850;
const RIGHT_BRANCH_X = 1750;

// Subtopic horizontal offsets
const LEFT_SUBTOPIC_X = 380;
const RIGHT_SUBTOPIC_X = 2220;

export function InteractiveMindmap() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform state: pan & zoom
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: -450, y: -250 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Interactive controls state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedDomain, setSelectedDomain] = useState<MindmapDomain | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<MindmapSubtopic | null>(null);
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Auto-center canvas on initial mount
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const initialZoom = clientWidth < 768 ? 0.45 : clientWidth < 1280 ? 0.65 : 0.82;
      setZoom(initialZoom);
      setPan({
        x: (clientWidth - CANVAS_WIDTH * initialZoom) / 2,
        y: (clientHeight - CANVAS_HEIGHT * initialZoom) / 2,
      });
    }
  }, []);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Zoom helpers
  const handleZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.min(1.8, Math.max(0.35, Number((prev + delta).toFixed(2)))));
  }, []);

  const resetView = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const targetZoom = clientWidth < 768 ? 0.45 : 0.82;
      setZoom(targetZoom);
      setPan({
        x: (clientWidth - CANVAS_WIDTH * targetZoom) / 2,
        y: (clientHeight - CANVAS_HEIGHT * targetZoom) / 2,
      });
      setSelectedSubtopic(null);
    }
  }, []);

  // Pan interaction handlers (mouse drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const zoomFactor = -e.deltaY * 0.002;
      setZoom((prev) => Math.min(1.8, Math.max(0.35, Number((prev + zoomFactor).toFixed(2)))));
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Expand / collapse branch
  const toggleDomainCollapse = (domainId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  const expandAll = () => setCollapsedDomains(new Set());
  const collapseAll = () => {
    const all = new Set(MINDMAP_DOMAINS.map((d) => d.id));
    setCollapsedDomains(all);
  };

  // Filter & search filtering
  const filteredDomains = useMemo(() => {
    if (activeFilter === "all") return MINDMAP_DOMAINS;
    return MINDMAP_DOMAINS.filter((d) => d.id === activeFilter);
  }, [activeFilter]);

  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const q = searchQuery.toLowerCase();
    const matched = new Set<string>();

    MINDMAP_DOMAINS.forEach((domain) => {
      if (
        domain.title.toLowerCase().includes(q) ||
        domain.summary.toLowerCase().includes(q)
      ) {
        matched.add(domain.id);
      }
      domain.subtopics.forEach((sub) => {
        if (
          sub.name.toLowerCase().includes(q) ||
          sub.desc.toLowerCase().includes(q) ||
          sub.protocols.some((p) => p.toLowerCase().includes(q))
        ) {
          matched.add(domain.id);
          matched.add(sub.id);
        }
      });
    });

    return matched;
  }, [searchQuery]);

  // Compute calculated positions for nodes so they spread out organically
  const layoutNodes = useMemo(() => {
    const leftDomains = MINDMAP_DOMAINS.filter((d) => d.side === "left");
    const rightDomains = MINDMAP_DOMAINS.filter((d) => d.side === "right");

    const leftSpacing = CANVAS_HEIGHT / (leftDomains.length + 1);
    const rightSpacing = CANVAS_HEIGHT / (rightDomains.length + 1);

    const positions: Record<
      string,
      { x: number; y: number; subtopics: Array<{ id: string; x: number; y: number }> }
    > = {};

    leftDomains.forEach((domain, idx) => {
      const branchY = (idx + 1) * leftSpacing;
      const subtopicCount = domain.subtopics.length;
      const subtopicSpread = 320;
      const subtopicStartY = branchY - ((subtopicCount - 1) * subtopicSpread) / 2;

      positions[domain.id] = {
        x: LEFT_BRANCH_X,
        y: branchY,
        subtopics: domain.subtopics.map((sub, sIdx) => ({
          id: sub.id,
          x: LEFT_SUBTOPIC_X,
          y: subtopicStartY + sIdx * subtopicSpread,
        })),
      };
    });

    rightDomains.forEach((domain, idx) => {
      const branchY = (idx + 1) * rightSpacing;
      const subtopicCount = domain.subtopics.length;
      const subtopicSpread = 280;
      const subtopicStartY = branchY - ((subtopicCount - 1) * subtopicSpread) / 2;

      positions[domain.id] = {
        x: RIGHT_BRANCH_X,
        y: branchY,
        subtopics: domain.subtopics.map((sub, sIdx) => ({
          id: sub.id,
          x: RIGHT_SUBTOPIC_X,
          y: subtopicStartY + sIdx * subtopicSpread,
        })),
      };
    });

    return positions;
  }, []);

  // Copy code helper
  const copySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    toast.success("Snippet copied to clipboard");
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden select-none border border-[var(--border)] bg-[#070709] rounded-3xl shadow-2xl transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-dvh w-screen" : "h-[calc(100vh-140px)] min-h-[760px]"
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* ─── DOT GRID BACKGROUND ──────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ─── TOP CONTROL TOOLBAR ─────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Search & Filter bar */}
        <div className="flex flex-wrap items-center gap-2 bg-[var(--surface-1)]/90 backdrop-blur-xl border border-[var(--border)] p-1.5 rounded-2xl shadow-xl">
          {/* Live Search */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-[var(--muted-foreground)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, Kafka, Iceberg, dbt..."
              className="w-48 sm:w-64 pl-8 pr-7 py-1.5 rounded-xl bg-[var(--surface-2)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] border border-[var(--border)] focus:outline-none focus:border-purple-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Quick Domain Filters */}
          <div className="hidden lg:flex items-center gap-1 pl-1 border-l border-[var(--border)]">
            <button
              onClick={() => setActiveFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                activeFilter === "all"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
            >
              All 7 Domains
            </button>
            {MINDMAP_DOMAINS.map((domain) => (
              <button
                key={domain.id}
                onClick={() => setActiveFilter(domain.id === activeFilter ? "all" : domain.id)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1",
                  activeFilter === domain.id
                    ? `${domain.color.badge} font-bold shadow-sm`
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                )}
              >
                <span>{domain.shortTitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Zoom & Navigation Tools */}
        <div className="flex items-center gap-1.5 bg-[var(--surface-1)]/90 backdrop-blur-xl border border-[var(--border)] p-1.5 rounded-2xl shadow-xl">
          <button
            onClick={() => handleZoom(0.15)}
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => handleZoom(-0.15)}
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-[11px] font-mono text-[var(--muted-foreground)] px-1.5 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={resetView}
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
            title="Reset to Fit"
            aria-label="Reset view"
          >
            <RotateCcw size={15} />
          </button>
          <div className="h-4 w-px bg-[var(--border)] mx-0.5" />
          <button
            onClick={collapsedDomains.size > 0 ? expandAll : collapseAll}
            className="px-2 py-1 rounded-xl text-[11px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
            title={collapsedDomains.size > 0 ? "Expand All Branches" : "Collapse All Branches"}
          >
            {collapsedDomains.size > 0 ? "Expand All" : "Collapse All"}
          </button>
          <div className="h-4 w-px bg-[var(--border)] mx-0.5" />
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mindmap"}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* ─── VIRTUAL CANVAS (TRANSLATED & SCALED) ────────────────────── */}
      <div
        className="absolute origin-top-left transition-transform duration-75 ease-out"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
        }}
      >
        {/* ─── SVG CONNECTOR LINES LAYER ───────────────────────────── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {MINDMAP_DOMAINS.map((domain) => (
              <linearGradient
                key={`grad-${domain.id}`}
                id={`grad-${domain.id}`}
                x1={domain.side === "left" ? "100%" : "0%"}
                y1="50%"
                x2={domain.side === "left" ? "0%" : "100%"}
                y2="50%"
              >
                <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
                <stop offset="100%" stopColor={domain.color.hex} stopOpacity="0.8" />
              </linearGradient>
            ))}
          </defs>

          {/* Curves from ROOT HUB to each DOMAIN BRANCH */}
          {filteredDomains.map((domain) => {
            const pos = layoutNodes[domain.id];
            if (!pos) return null;

            const isLeft = domain.side === "left";
            const rootAnchorX = isLeft ? ROOT_X - 180 : ROOT_X + 180;
            const rootAnchorY = ROOT_Y;

            const branchAnchorX = isLeft ? pos.x + 160 : pos.x - 160;
            const branchAnchorY = pos.y;

            const dx = Math.abs(branchAnchorX - rootAnchorX) * 0.55;
            const cx1 = isLeft ? rootAnchorX - dx : rootAnchorX + dx;
            const cx2 = isLeft ? branchAnchorX + dx : branchAnchorX - dx;

            const isSelected = selectedDomain?.id === domain.id;
            const isMatched = searchMatches.has(domain.id);

            return (
              <g key={`root-conn-${domain.id}`}>
                <path
                  d={`M ${rootAnchorX} ${rootAnchorY} C ${cx1} ${rootAnchorY}, ${cx2} ${branchAnchorY}, ${branchAnchorX} ${branchAnchorY}`}
                  fill="none"
                  stroke={domain.color.hex}
                  strokeWidth={isSelected || isMatched ? 5 : 3}
                  strokeOpacity={isSelected || isMatched ? 0.6 : 0.25}
                  strokeLinecap="round"
                />
                <path
                  d={`M ${rootAnchorX} ${rootAnchorY} C ${cx1} ${rootAnchorY}, ${cx2} ${branchAnchorY}, ${branchAnchorX} ${branchAnchorY}`}
                  fill="none"
                  stroke={`url(#grad-${domain.id})`}
                  strokeWidth={isSelected || isMatched ? 3 : 2}
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* Curves from DOMAIN BRANCH to SUBTOPICS */}
          {filteredDomains.map((domain) => {
            if (collapsedDomains.has(domain.id)) return null;
            const pos = layoutNodes[domain.id];
            if (!pos) return null;

            const isLeft = domain.side === "left";
            const branchAnchorX = isLeft ? pos.x - 160 : pos.x + 160;
            const branchAnchorY = pos.y;

            return pos.subtopics.map((subPos) => {
              const subAnchorX = isLeft ? subPos.x + 150 : subPos.x - 150;
              const subAnchorY = subPos.y;

              const dx = Math.abs(subAnchorX - branchAnchorX) * 0.5;
              const cx1 = isLeft ? branchAnchorX - dx : branchAnchorX + dx;
              const cx2 = isLeft ? subAnchorX + dx : subAnchorX - dx;

              const isSubSelected = selectedSubtopic?.id === subPos.id;
              const isSubMatched = searchMatches.has(subPos.id);

              return (
                <g key={`sub-conn-${subPos.id}`}>
                  <path
                    d={`M ${branchAnchorX} ${branchAnchorY} C ${cx1} ${branchAnchorY}, ${cx2} ${subAnchorY}, ${subAnchorX} ${subAnchorY}`}
                    fill="none"
                    stroke={domain.color.hex}
                    strokeWidth={isSubSelected || isSubMatched ? 3.5 : 1.5}
                    strokeOpacity={isSubSelected || isSubMatched ? 0.7 : 0.22}
                    strokeLinecap="round"
                  />
                </g>
              );
            });
          })}
        </svg>

        {/* ─── CENTRAL ROOT NODE ───────────────────────────── */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          style={{ left: `${ROOT_X}px`, top: `${ROOT_Y}px` }}
        >
          <div className="relative group p-1 rounded-3xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 p-[2px] shadow-2xl">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-40 blur-xl group-hover:opacity-60 transition-opacity" />
            <div className="relative w-80 p-6 rounded-3xl bg-[var(--surface-0)] border border-[var(--border)] flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                <Sparkles size={24} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Enterprise Data Stack 2026
                </span>
                <h2 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
                  Modern Data Architecture
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] leading-snug">
                  7 Core Domains · Open Lakehouse · Vector Engines · Zero-Copy Serving
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-semibold text-purple-300">
                <span>Click any node to inspect</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── LEVEL 1: DOMAIN BRANCH NODES ───────────────────────────── */}
        {filteredDomains.map((domain) => {
          const pos = layoutNodes[domain.id];
          if (!pos) return null;

          const isCollapsed = collapsedDomains.has(domain.id);
          const isSelected = selectedDomain?.id === domain.id;
          const isMatched = searchMatches.has(domain.id);

          return (
            <div
              key={domain.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
            >
              <div
                onClick={() => {
                  setSelectedDomain(domain);
                  setSelectedSubtopic(domain.subtopics[0]);
                }}
                className={cn(
                  "w-80 p-4 rounded-2xl border transition-all duration-300 shadow-xl cursor-pointer group backdrop-blur-xl",
                  isSelected
                    ? `bg-[var(--surface-1)] ${domain.color.border} ring-2 ring-purple-500/50 scale-105`
                    : isMatched
                    ? `bg-[var(--surface-1)] ${domain.color.border} ring-2 ring-cyan-400 scale-102`
                    : "bg-[var(--surface-1)]/95 border-[var(--border)] hover:border-[var(--border-hover)] hover:scale-102"
                )}
                style={{
                  boxShadow: isSelected ? `0 0 35px ${domain.color.glow}` : undefined,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                        domain.color.bg,
                        domain.color.border,
                        domain.color.text
                      )}
                    >
                      {getDomainIcon(domain.icon, 18)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[var(--foreground)] truncate leading-tight">
                        {domain.title}
                      </h3>
                      <span className="text-[10px] text-[var(--muted-foreground)]">
                        {domain.subtopics.length} Architectural Subtopics
                      </span>
                    </div>
                  </div>

                  {/* Collapse Toggle Pill */}
                  <button
                    onClick={(e) => toggleDomainCollapse(domain.id, e)}
                    className="p-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors shrink-0"
                    title={isCollapsed ? "Expand Subtopics" : "Collapse Subtopics"}
                    aria-label={isCollapsed ? `Expand ${domain.title}` : `Collapse ${domain.title}`}
                  >
                    {isCollapsed ? (
                      domain.side === "left" ? <ChevronLeft size={15} /> : <ChevronRight size={15} />
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-1 text-purple-400">
                        {domain.subtopics.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* ─── LEVEL 2: SUBTOPIC NODES ─────────────────────────────────── */}
        {filteredDomains.map((domain) => {
          if (collapsedDomains.has(domain.id)) return null;
          const pos = layoutNodes[domain.id];
          if (!pos) return null;

          return pos.subtopics.map((subPos, idx) => {
            const sub = domain.subtopics[idx];
            if (!sub) return null;

            const isSelected = selectedSubtopic?.id === sub.id;
            const isMatched = searchMatches.has(sub.id);

            return (
              <div
                key={sub.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${subPos.x}px`, top: `${subPos.y}px` }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setSelectedDomain(domain);
                    setSelectedSubtopic(sub);
                  }}
                  className={cn(
                    "w-72 p-3.5 rounded-2xl border transition-all duration-200 shadow-md cursor-pointer space-y-2 backdrop-blur-md",
                    isSelected
                      ? `bg-[var(--surface-1)] ${domain.color.border} ring-2 ring-purple-500 shadow-xl scale-105`
                      : isMatched
                      ? "bg-[var(--surface-1)] border-cyan-400 ring-2 ring-cyan-400/50"
                      : "bg-[var(--surface-1)]/90 border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                  )}
                  style={{
                    boxShadow: isSelected ? `0 0 25px ${domain.color.glow}` : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-[var(--foreground)] leading-snug">
                      {sub.name}
                    </h4>
                    <ChevronRight
                      size={13}
                      className={cn(
                        "shrink-0 transition-transform",
                        isSelected ? "text-purple-400 translate-x-0.5" : "text-[var(--muted-foreground)]"
                      )}
                    />
                  </div>

                  <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                    {sub.desc}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {sub.protocols.slice(0, 3).map((protocol) => (
                      <span
                        key={protocol}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] opacity-80"
                      >
                        {protocol}
                      </span>
                    ))}
                    {sub.protocols.length > 3 && (
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                        +{sub.protocols.length - 3}
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          });
        })}
      </div>

      {/* ─── BOTTOM NAVIGATION & STATS HELPER ──────────────────── */}
      <div className="absolute bottom-4 left-4 z-30 pointer-events-auto bg-[var(--surface-1)]/90 backdrop-blur-xl border border-[var(--border)] px-4 py-2 rounded-2xl shadow-xl flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="font-semibold text-[var(--foreground)]">Interactive Mindmap Canvas</span>
        </div>
        <span className="hidden sm:inline text-[var(--muted-foreground)]">•</span>
        <span className="hidden sm:inline text-[var(--muted-foreground)]">
          Drag to Pan · Wheel to Zoom · Click nodes for deep dive
        </span>
        {searchMatches.size > 0 && (
          <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
            {searchMatches.size} Matches
          </span>
        )}
      </div>

      {/* ─── RIGHT SLIDE-OUT INSPECTOR DRAWER ────────────────────────── */}
      <AnimatePresence>
        {selectedSubtopic && selectedDomain && (
          <motion.div
            initial={{ opacity: 0, x: 380 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 380 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 bottom-0 z-40 w-full sm:w-[440px] bg-[var(--surface-1)] border-l border-[var(--border)] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto pointer-events-auto backdrop-blur-2xl"
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                      selectedDomain.color.badge
                    )}
                  >
                    {selectedDomain.shortTitle}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSubtopic(null)}
                  className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
                  aria-label="Close details"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
                  {selectedSubtopic.name}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {selectedSubtopic.desc}
                </p>
              </div>

              {/* Architectural Trade-offs Callout */}
              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Sparkles size={14} />
                  <span>Architectural Trade-Off &amp; Production Rubric</span>
                </div>
                <p className="text-xs text-[var(--foreground)] opacity-90 leading-relaxed">
                  {selectedSubtopic.tradeOffs}
                </p>
              </div>

              {/* Ecosystem & Protocols Badges */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Ecosystem Protocols &amp; Standard Tooling
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSubtopic.protocols.map((protocol) => (
                    <span
                      key={protocol}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)]"
                    >
                      {protocol}
                    </span>
                  ))}
                </div>
              </div>

              {/* Code Snippet */}
              {selectedSubtopic.codeSnippet && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Production Blueprint Snippet
                    </span>
                    <button
                      onClick={() => copySnippet(selectedSubtopic.codeSnippet!)}
                      className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300"
                    >
                      {hasCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{hasCopied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-black/70 border border-[var(--border)] text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                    <code>{selectedSubtopic.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="pt-6 mt-6 border-t border-[var(--border)] space-y-2">
              <Link
                href={selectedSubtopic.practiceLink}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 transition-all"
              >
                <span>Practice Interview Q&amp;As for this Topic</span>
                <ArrowRight size={15} />
              </Link>
              <p className="text-[11px] text-center text-[var(--muted-foreground)]">
                Directly opens verified question banks &amp; scenario simulations
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
