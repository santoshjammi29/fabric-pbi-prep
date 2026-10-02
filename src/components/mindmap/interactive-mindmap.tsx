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
  BookOpen,
  CheckCircle2,
  GripVertical,
  Activity,
  Move,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { conceptsDb } from "@/data";
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

/* ─── Architectural Flow Order (Sequential Lifecycle) ───────────────── */
const FLOW_SEQUENCE = [
  { id: "ingestion", step: "01", stage: "Ingestion & Streaming", flowRole: "Real-Time Capture" },
  { id: "storage", step: "02", stage: "Storage & Lakehouse", flowRole: "Open ACID Lake" },
  { id: "compute", step: "03", stage: "Unified Compute", flowRole: "Distributed Spark Engine" },
  { id: "orchestration", step: "04", stage: "DataOps & CI/CD", flowRole: "DAG Orchestration" },
  { id: "serving", step: "05", stage: "Analytical Serving", flowRole: "Zero-Copy Direct Lake" },
  { id: "governance", step: "06", stage: "Enterprise Governance", flowRole: "Unified Catalog & Lineage" },
  { id: "ai", step: "07", stage: "AI & Vector Retrieval", flowRole: "GenAI RAG Grounding" },
];

/* ─── Canvas Geometry Base Dimensions ────────────────────────────────── */
const CANVAS_WIDTH = 3400;
const CANVAS_HEIGHT = 4400;
const ROOT_X = 1700;
const ROOT_Y = 2200;

export function InteractiveMindmap() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform state: pan & zoom
  const [zoom, setZoom] = useState(0.55);
  const [pan, setPan] = useState({ x: -450, y: -900 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Interactive controls & search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedDomain, setSelectedDomain] = useState<MindmapDomain | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<MindmapSubtopic | null>(null);
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"rubric" | "concept">("rubric");
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [isFlowMode, setIsFlowMode] = useState(true);

  // Movable node drag offsets: { [nodeId]: { x: number; y: number } }
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const dragNodeRef = useRef<{
    id: string;
    clientX: number;
    clientY: number;
    initialOffset: { x: number; y: number };
    hasMoved: boolean;
  } | null>(null);

  // Minimap container dimensions tracker
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 750 });

  /* ─── Track Container Dimensions ───────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 1200,
          height: containerRef.current.clientHeight || 750,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  /* ─── ISOLATE SCROLLING: Wheel on canvas pans/zooms without scrolling window ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      // Prevent the outer browser window from scrolling
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom / trackpad pinch
        const zoomDelta = -e.deltaY * 0.003;
        setZoom((prev) => Math.min(1.8, Math.max(0.35, Number((prev + zoomDelta).toFixed(3)))));
      } else {
        // Smooth canvas panning
        setPan((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    container.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheelNative);
    };
  }, []);

  /* ─── Handle Node Dragging (Mouse Move & Up attached to window) ────────── */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragNodeRef.current) return;

      const { id, clientX, clientY, initialOffset } = dragNodeRef.current;
      const dx = (e.clientX - clientX) / zoom;
      const dy = (e.clientY - clientY) / zoom;

      if (Math.hypot(dx, dy) > 4) {
        dragNodeRef.current.hasMoved = true;
      }

      setNodeOffsets((prev) => ({
        ...prev,
        [id]: {
          x: Math.round(initialOffset.x + dx),
          y: Math.round(initialOffset.y + dy),
        },
      }));
    };

    const handleMouseUp = () => {
      if (dragNodeRef.current) {
        dragNodeRef.current = null;
        setActiveDragId(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [zoom]);

  /* ─── Canvas Panning (Drag Background) ─────────────────────────────── */
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input") || target.closest("[data-node='true']")) {
      return;
    }

    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPan({
      x: panStartRef.current.panX + dx,
      y: panStartRef.current.panY + dy,
    });
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  /* ─── Node Drag Initiation ─────────────────────────────────────────── */
  const startNodeDrag = (nodeId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    dragNodeRef.current = {
      id: nodeId,
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffset: nodeOffsets[nodeId] || { x: 0, y: 0 },
      hasMoved: false,
    };
    setActiveDragId(nodeId);
  };

  /* ─── URL Query Param Sync ─────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const target = params.get("node") || params.get("conceptId") || params.get("highlight");
      if (target) {
        for (const domain of MINDMAP_DOMAINS) {
          const match = domain.subtopics.find(
            (s) =>
              s.id.toLowerCase() === target.toLowerCase() ||
              (s.conceptId && s.conceptId.toLowerCase() === target.toLowerCase()) ||
              s.name.toLowerCase().includes(target.toLowerCase())
          );
          if (match) {
            setSelectedDomain(domain);
            setSelectedSubtopic(match);
            setHighlightedNodeId(match.id);
            setDrawerTab("concept");
            break;
          }
        }
      }
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  /* ─── Initial Center Pan & Zoom ────────────────────────────────────── */
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const initialZoom = clientWidth < 768 ? 0.35 : clientWidth < 1280 ? 0.45 : 0.55;
      setZoom(initialZoom);
      setPan({
        x: (clientWidth - CANVAS_WIDTH * initialZoom) / 2,
        y: (clientHeight - CANVAS_HEIGHT * initialZoom) / 2,
      });
    }
  }, []);

  /* ─── Reset View / Tidy Up ─────────────────────────────────────────── */
  const resetView = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const targetZoom = clientWidth < 768 ? 0.35 : 0.55;
      setZoom(targetZoom);
      setPan({
        x: (clientWidth - CANVAS_WIDTH * targetZoom) / 2,
        y: (clientHeight - CANVAS_HEIGHT * targetZoom) / 2,
      });
      setSelectedSubtopic(null);
    }
  }, []);

  const tidyLayout = () => {
    setNodeOffsets({});
    toast.success("Nodes rearranged to clean architectural layout", {
      description: "Subtopics, domain hubs, and flow paths aligned with collision-free spacing.",
    });
  };

  const handleZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.min(1.8, Math.max(0.35, Number((prev + delta).toFixed(2)))));
  }, []);

  /* ─── Fullscreen Toggle ────────────────────────────────────────────── */
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

  /* ─── Collapse / Expand Helpers ─────────────────────────────────────── */
  const toggleDomainCollapse = (domainId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) next.delete(domainId);
      else next.add(domainId);
      return next;
    });
  };

  const expandAll = () => setCollapsedDomains(new Set());
  const collapseAll = () => {
    setCollapsedDomains(new Set(MINDMAP_DOMAINS.map((d) => d.id)));
  };

  /* ─── Filters & Search ──────────────────────────────────────────────── */
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

  /* ─── Collision-Free Base Positions Math ─────────────────────────────── */
  // Left side: 3 domains. Right side: 4 domains.
  // Each domain has 4 subtopics.
  // Subtopics and domains are allocated non-overlapping vertical zones!
  const baseLayout = useMemo(() => {
    const positions: Record<
      string,
      {
        x: number;
        y: number;
        subtopics: Array<{ id: string; x: number; y: number }>;
      }
    > = {};

    // LEFT DOMAINS (Ingestion, Storage, Compute)
    const leftBranchX = 1100;
    const leftSubtopicX = 520;
    const leftDomainYConfigs = [
      { id: "ingestion", centerY: 750 },
      { id: "storage", centerY: 2200 },
      { id: "compute", centerY: 3650 },
    ];

    leftDomainYConfigs.forEach((cfg) => {
      const domain = MINDMAP_DOMAINS.find((d) => d.id === cfg.id);
      if (!domain) return;
      const count = domain.subtopics.length;
      const pitch = 230;
      const startY = cfg.centerY - ((count - 1) * pitch) / 2;

      positions[domain.id] = {
        x: leftBranchX,
        y: cfg.centerY,
        subtopics: domain.subtopics.map((sub, sIdx) => ({
          id: sub.id,
          x: leftSubtopicX,
          y: startY + sIdx * pitch,
        })),
      };
    });

    // RIGHT DOMAINS (Orchestration, Serving, Governance, AI)
    const rightBranchX = 2300;
    const rightSubtopicX = 2880;
    const rightDomainYConfigs = [
      { id: "orchestration", centerY: 580 },
      { id: "serving", centerY: 1660 },
      { id: "governance", centerY: 2740 },
      { id: "ai", centerY: 3820 },
    ];

    rightDomainYConfigs.forEach((cfg) => {
      const domain = MINDMAP_DOMAINS.find((d) => d.id === cfg.id);
      if (!domain) return;
      const count = domain.subtopics.length;
      const pitch = 230;
      const startY = cfg.centerY - ((count - 1) * pitch) / 2;

      positions[domain.id] = {
        x: rightBranchX,
        y: cfg.centerY,
        subtopics: domain.subtopics.map((sub, sIdx) => ({
          id: sub.id,
          x: rightSubtopicX,
          y: startY + sIdx * pitch,
        })),
      };
    });

    return positions;
  }, []);

  /* ─── Dynamic Layout with Active User Node Offsets ──────────────────── */
  const layoutNodes = useMemo(() => {
    const computed: Record<
      string,
      {
        x: number;
        y: number;
        subtopics: Array<{ id: string; x: number; y: number }>;
      }
    > = {};

    Object.entries(baseLayout).forEach(([domainId, bPos]) => {
      const dOffset = nodeOffsets[domainId] || { x: 0, y: 0 };
      computed[domainId] = {
        x: bPos.x + dOffset.x,
        y: bPos.y + dOffset.y,
        subtopics: bPos.subtopics.map((sub) => {
          const sOffset = nodeOffsets[sub.id] || { x: 0, y: 0 };
          return {
            id: sub.id,
            x: sub.x + sOffset.x,
            y: sub.y + sOffset.y,
          };
        }),
      };
    });

    return computed;
  }, [baseLayout, nodeOffsets]);

  // Root node position with offset
  const rootActualX = ROOT_X + (nodeOffsets["root"]?.x || 0);
  const rootActualY = ROOT_Y + (nodeOffsets["root"]?.y || 0);

  // Copy code helper
  const copySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    toast.success("Snippet copied to clipboard");
    setTimeout(() => setHasCopied(false), 2000);
  };

  /* ─── Flow Sequence Path Coordinates ────────────────────────────────── */
  const flowPathData = useMemo(() => {
    if (!isFlowMode) return "";
    const points: Array<{ x: number; y: number }> = [];

    FLOW_SEQUENCE.forEach((item) => {
      const pos = layoutNodes[item.id];
      if (pos) {
        points.push({ x: pos.x, y: pos.y });
      }
    });

    if (points.length < 2) return "";

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const mx = (p1.x + p2.x) / 2;
      d += ` C ${mx} ${p1.y}, ${mx} ${p2.y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [layoutNodes, isFlowMode]);

  return (
    <>
      {/* ─── DESKTOP INTERACTIVE CANVAS VIEW (Hidden on Mobile) ─────────── */}
      <div
        ref={containerRef}
        className={cn(
          "relative w-full overflow-hidden select-none border border-[var(--border)] bg-[var(--surface-0)] rounded-3xl shadow-2xl transition-all duration-300 hidden lg:block",
          isFullscreen ? "fixed inset-0 z-50 rounded-none h-dvh w-screen" : "min-h-[640px]"
        )}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        style={{
          cursor: isPanning ? "grabbing" : "grab",
          touchAction: "none",
          height: isFullscreen ? undefined : "clamp(640px, calc(100svh - 150px), 1100px)",
        }}
      >
        {/* Dot Grid Background (Theme-Adaptive) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--muted-foreground) 1.2px, transparent 1.2px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* ─── TOP CONTROL TOOLBAR ─────────────────────────────────────── */}
        <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          {/* Left: Search & Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 bg-[var(--surface-1)]/90 backdrop-blur-xl border border-[var(--border)] p-1.5 rounded-2xl shadow-xl">
            {/* Live Search */}
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-[var(--muted-foreground)] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search concepts, Kafka, Iceberg, dbt..."
                className="w-48 sm:w-60 pl-8 pr-7 py-1.5 rounded-xl bg-[var(--surface-2)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] border border-[var(--border)] focus:outline-none focus:border-purple-500 transition-colors"
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
            <div className="hidden xl:flex items-center gap-1 pl-1 border-l border-[var(--border)]">
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

          {/* Right: Modern Mindmap Tools (Movable nodes, Zoom, Flow Mode, Fullscreen) */}
          <div className="flex items-center gap-1.5 bg-[var(--surface-1)]/90 backdrop-blur-xl border border-[var(--border)] p-1.5 rounded-2xl shadow-xl">
            {/* Live Data Flow Toggle */}
            <button
              onClick={() => setIsFlowMode(!isFlowMode)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                isFlowMode
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
              title="Toggle animated architectural data flow pipeline"
            >
              <Activity size={14} className={cn("transition-transform", isFlowMode && "text-cyan-400 animate-pulse")} />
              <span className="hidden sm:inline">Data Flow</span>
            </button>

            {/* Tidy Up / Auto Align Nodes */}
            <button
              onClick={tidyLayout}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-all cursor-pointer"
              title="Auto-organize movable nodes back to collision-free positions"
            >
              <Sparkles size={14} className="text-purple-400" />
              <span className="hidden sm:inline">Tidy Up</span>
            </button>

            <div className="h-4 w-px bg-[var(--border)] mx-0.5" />

            {/* Zoom Controls */}
            <button
              onClick={() => handleZoom(0.15)}
              className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-[11px] font-mono text-[var(--muted-foreground)] px-1 min-w-[2.8rem] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={resetView}
              className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              title="Reset View & Center"
              aria-label="Reset view"
            >
              <RotateCcw size={14} />
            </button>

            <div className="h-4 w-px bg-[var(--border)] mx-0.5" />

            <button
              onClick={collapsedDomains.size > 0 ? expandAll : collapseAll}
              className="px-2 py-1 rounded-xl text-[11px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              title={collapsedDomains.size > 0 ? "Expand All Branches" : "Collapse All Branches"}
            >
              {collapsedDomains.size > 0 ? "Expand All" : "Collapse All"}
            </button>

            <div className="h-4 w-px bg-[var(--border)] mx-0.5" />

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mindmap"}
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        {/* ─── VIRTUAL CANVAS (Translated, Scaled, Non-Window-Scrolling) ─── */}
        <div
          className="absolute origin-top-left transition-transform duration-75 ease-out"
          style={{
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          }}
        >
          {/* ─── SVG CONNECTORS & FLOW LAYER ─────────────────────────── */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <style>{`
                @keyframes flowDashAnim {
                  to { stroke-dashoffset: -40; }
                }
                .flow-active-line {
                  animation: flowDashAnim 1.6s linear infinite;
                }
              `}</style>

              {/* Linear Gradients per Domain */}
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
                  <stop offset="100%" stopColor={domain.color.hex} stopOpacity="0.85" />
                </linearGradient>
              ))}

              {/* Data Flow Sequential Stream Gradient */}
              <linearGradient id="flowStreamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                <stop offset="25%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="75%" stopColor="#8b5cf6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* 1. ARCHITECTURAL SEQUENTIAL DATA FLOW PIPELINE (When isFlowMode = true) */}
            {isFlowMode && flowPathData && (
              <g className="flow-pipeline-group">
                {/* Background glow stroke */}
                <path
                  d={flowPathData}
                  fill="none"
                  stroke="url(#flowStreamGrad)"
                  strokeWidth={8}
                  strokeOpacity={0.18}
                  strokeLinecap="round"
                />
                {/* Animated dash line */}
                <path
                  d={flowPathData}
                  fill="none"
                  stroke="url(#flowStreamGrad)"
                  strokeWidth={3}
                  strokeDasharray="10 10"
                  strokeLinecap="round"
                  className="flow-active-line"
                  strokeOpacity={0.85}
                />
              </g>
            )}

            {/* 2. ROOT HUB TO DOMAIN CONNECTIONS */}
            {filteredDomains.map((domain) => {
              const pos = layoutNodes[domain.id];
              if (!pos) return null;

              const isLeft = domain.side === "left";
              const rootAnchorX = isLeft ? rootActualX - 180 : rootActualX + 180;
              const rootAnchorY = rootActualY;

              const branchAnchorX = isLeft ? pos.x + 160 : pos.x - 160;
              const branchAnchorY = pos.y;

              const dx = Math.abs(branchAnchorX - rootAnchorX) * 0.55;
              const cx1 = isLeft ? rootAnchorX - dx : rootAnchorX + dx;
              const cx2 = isLeft ? branchAnchorX + dx : branchAnchorX - dx;

              const isSelected = selectedDomain?.id === domain.id;
              const isMatched = searchMatches.has(domain.id);

              return (
                <g key={`root-conn-${domain.id}`}>
                  {/* Subtle wide glow line */}
                  <path
                    d={`M ${rootAnchorX} ${rootAnchorY} C ${cx1} ${rootAnchorY}, ${cx2} ${branchAnchorY}, ${branchAnchorX} ${branchAnchorY}`}
                    fill="none"
                    stroke={domain.color.hex}
                    strokeWidth={isSelected || isMatched ? 6 : 3.5}
                    strokeOpacity={isSelected || isMatched ? 0.6 : 0.22}
                    strokeLinecap="round"
                  />
                  {/* Crisp primary line */}
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

            {/* 3. DOMAIN BRANCH TO SUBTOPIC CONNECTIONS */}
            {filteredDomains.map((domain) => {
              if (collapsedDomains.has(domain.id)) return null;
              const pos = layoutNodes[domain.id];
              if (!pos) return null;

              const isLeft = domain.side === "left";
              const branchAnchorX = isLeft ? pos.x - 160 : pos.x + 160;
              const branchAnchorY = pos.y;

              return pos.subtopics.map((subPos) => {
                const subAnchorX = isLeft ? subPos.x + 145 : subPos.x - 145;
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
                      strokeWidth={isSubSelected || isSubMatched ? 3.5 : 1.8}
                      strokeOpacity={isSubSelected || isSubMatched ? 0.8 : 0.28}
                      strokeLinecap="round"
                    />
                  </g>
                );
              });
            })}
          </svg>

          {/* ─── CENTRAL ROOT NODE (MOVABLE) ─────────────────────────── */}
          <div
            data-node="true"
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-shadow"
            style={{ left: `${rootActualX}px`, top: `${rootActualY}px` }}
            onMouseDown={(e) => startNodeDrag("root", e)}
          >
            <div className="relative group p-[2px] rounded-3xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 shadow-2xl cursor-grab active:cursor-grabbing">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-40 blur-xl group-hover:opacity-60 transition-opacity" />
              <div className="relative w-84 p-6 rounded-3xl bg-[var(--surface-0)] border border-[var(--border)] flex flex-col items-center text-center space-y-3">
                {/* Drag handle pill */}
                <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)] opacity-70 group-hover:opacity-100 transition-opacity">
                  <Move size={11} />
                  <span>Movable Central Hub</span>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                  <Sparkles size={24} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    Enterprise Data Stack 2026
                  </span>
                  <h2 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
                    Modern Data Architecture
                  </h2>
                  <p className="text-xs text-[var(--muted-foreground)] leading-snug">
                    7 Core Domains · Open Lakehouse · Vector Engines · Zero-Copy Serving
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                  <span>Click any node to inspect · Drag to arrange</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── LEVEL 1: DOMAIN BRANCH NODES (MOVABLE) ───────────────── */}
          {filteredDomains.map((domain) => {
            const pos = layoutNodes[domain.id];
            if (!pos) return null;

            const isCollapsed = collapsedDomains.has(domain.id);
            const isSelected = selectedDomain?.id === domain.id;
            const isMatched = searchMatches.has(domain.id);
            const isDragging = activeDragId === domain.id;
            const flowInfo = FLOW_SEQUENCE.find((f) => f.id === domain.id);

            return (
              <div
                key={domain.id}
                data-node="true"
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-transform duration-75",
                  isDragging && "scale-105 z-30"
                )}
                style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                onMouseDown={(e) => startNodeDrag(domain.id, e)}
              >
                <div
                  onClick={() => {
                    if (dragNodeRef.current?.hasMoved) return;
                    setSelectedDomain(domain);
                    setSelectedSubtopic(domain.subtopics[0]);
                  }}
                  className={cn(
                    "w-84 p-4 rounded-2xl border transition-all duration-200 shadow-xl cursor-grab active:cursor-grabbing group backdrop-blur-xl",
                    isSelected
                      ? `bg-[var(--surface-1)] ${domain.color.border} ring-2 ring-purple-500/70 shadow-2xl`
                      : isMatched
                      ? `bg-[var(--surface-1)] ${domain.color.border} ring-2 ring-cyan-400 shadow-2xl`
                      : "bg-[var(--surface-1)]/95 border-[var(--border)] hover:border-[var(--border-hover)] hover:scale-102"
                  )}
                  style={{
                    boxShadow: isSelected ? `0 0 35px ${domain.color.glow}` : undefined,
                  }}
                >
                  {/* Top Flow Step Indicator */}
                  {isFlowMode && flowInfo && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]/60 text-[10px] font-mono">
                      <span className="font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1">
                        <Activity size={10} className="animate-pulse" />
                        FLOW #{flowInfo.step}
                      </span>
                      <span className="text-[var(--muted-foreground)] font-medium truncate max-w-[170px]">
                        {flowInfo.flowRole}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Drag Grip Handle */}
                      <GripVertical
                        size={15}
                        className="text-[var(--muted-foreground)] opacity-40 group-hover:opacity-100 transition-opacity shrink-0"
                      />

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
                        <span className="text-[10px] text-[var(--muted-foreground)] font-medium">
                          {domain.subtopics.length} Architectural Subtopics
                        </span>
                      </div>
                    </div>

                    {/* Collapse Toggle Pill */}
                    <button
                      onClick={(e) => toggleDomainCollapse(domain.id, e)}
                      className="p-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors shrink-0 cursor-pointer"
                      title={isCollapsed ? "Expand Subtopics" : "Collapse Subtopics"}
                      aria-label={isCollapsed ? `Expand ${domain.title}` : `Collapse ${domain.title}`}
                    >
                      {isCollapsed ? (
                        domain.side === "left" ? <ChevronLeft size={15} /> : <ChevronRight size={15} />
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-1 text-purple-700 dark:text-purple-400">
                          {domain.subtopics.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ─── LEVEL 2: SUBTOPIC NODES (MOVABLE & NON-OVERLAPPING) ───── */}
          {filteredDomains.map((domain) => {
            if (collapsedDomains.has(domain.id)) return null;
            const pos = layoutNodes[domain.id];
            if (!pos) return null;

            return pos.subtopics.map((subPos, idx) => {
              const sub = domain.subtopics[idx];
              if (!sub) return null;

              const isSelected = selectedSubtopic?.id === sub.id;
              const isMatched = searchMatches.has(sub.id);
              const isDragging = activeDragId === sub.id;

              return (
                <div
                  key={sub.id}
                  data-node="true"
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-transform duration-75",
                    isDragging && "scale-105 z-30"
                  )}
                  style={{ left: `${subPos.x}px`, top: `${subPos.y}px` }}
                  onMouseDown={(e) => startNodeDrag(sub.id, e)}
                >
                  <div
                    onClick={() => {
                      if (dragNodeRef.current?.hasMoved) return;
                      setSelectedDomain(domain);
                      setSelectedSubtopic(sub);
                    }}
                    className={cn(
                      "w-76 p-3.5 rounded-2xl border transition-all duration-200 shadow-md cursor-grab active:cursor-grabbing space-y-2 backdrop-blur-md group",
                      isSelected
                        ? `bg-[var(--surface-1)] ${domain.color.border} ring-2 ring-purple-500 shadow-xl scale-102`
                        : highlightedNodeId === sub.id
                        ? "bg-[var(--surface-1)] border-cyan-400 ring-4 ring-cyan-400/80 shadow-2xl animate-pulse scale-102"
                        : isMatched
                        ? "bg-[var(--surface-1)] border-cyan-400 ring-2 ring-cyan-400/50"
                        : "bg-[var(--surface-1)]/90 border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                    )}
                    style={{
                      boxShadow: isSelected ? `0 0 25px ${domain.color.glow}` : undefined,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* Drag Handle Grip Icon */}
                        <GripVertical
                          size={13}
                          className="text-[var(--muted-foreground)] opacity-40 group-hover:opacity-100 transition-opacity shrink-0"
                        />
                        <h4 className="text-xs font-bold text-[var(--foreground)] leading-snug truncate">
                          {sub.name}
                        </h4>
                      </div>
                      <ChevronRight
                        size={13}
                        className={cn(
                          "shrink-0 transition-transform",
                          isSelected ? "text-purple-600 dark:text-purple-400 translate-x-0.5" : "text-[var(--muted-foreground)]"
                        )}
                      />
                    </div>

                    <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed font-normal">
                      {sub.desc}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {sub.protocols.slice(0, 3).map((protocol) => (
                        <span
                          key={protocol}
                          className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)]"
                        >
                          {protocol}
                        </span>
                      ))}
                      {sub.protocols.length > 3 && (
                        <span className="text-[9px] font-mono font-medium px-1 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]">
                          +{sub.protocols.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })}
        </div>

        {/* ─── BOTTOM-LEFT NAVIGATION & STATUS BAR ───────────────────── */}
        <div className="absolute bottom-4 left-4 z-30 pointer-events-auto bg-[var(--surface-1)]/90 backdrop-blur-xl border border-[var(--border)] px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-semibold text-[var(--foreground)]">Infinite Mindmap</span>
          </div>
          <span className="hidden sm:inline text-[var(--muted-foreground)]">•</span>
          <span className="hidden sm:inline text-[var(--muted-foreground)]">
            Drag Nodes to Move · Wheel to Pan · Pinch to Zoom
          </span>
          {searchMatches.size > 0 && (
            <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              {searchMatches.size} Matches
            </span>
          )}
        </div>

        {/* ─── BOTTOM-RIGHT RADAR MINIMAP ─────────────────────────────── */}
        <div className="absolute bottom-4 right-4 z-30 pointer-events-auto hidden sm:block">
          <div
            className="w-44 h-32 rounded-2xl bg-[var(--surface-1)]/90 backdrop-blur-xl border border-[var(--border)] shadow-xl relative overflow-hidden cursor-crosshair group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const clickY = e.clientY - rect.top;
              const targetCanvasX = (clickX / 176) * CANVAS_WIDTH;
              const targetCanvasY = (clickY / 128) * CANVAS_HEIGHT;
              setPan({
                x: containerSize.width / 2 - targetCanvasX * zoom,
                y: containerSize.height / 2 - targetCanvasY * zoom,
              });
            }}
            title="Radar Minimap — Click to pan canvas"
          >
            {/* Minimap Grid */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:8px_8px]" />

            {/* Minimap Root Node */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_6px_rgba(168,85,247,0.8)]"
              style={{
                left: `${(rootActualX / CANVAS_WIDTH) * 176}px`,
                top: `${(rootActualY / CANVAS_HEIGHT) * 128}px`,
              }}
            />

            {/* Minimap Domain Dots */}
            {MINDMAP_DOMAINS.map((domain) => {
              const pos = layoutNodes[domain.id];
              if (!pos) return null;
              return (
                <div
                  key={`mm-${domain.id}`}
                  className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(pos.x / CANVAS_WIDTH) * 176}px`,
                    top: `${(pos.y / CANVAS_HEIGHT) * 128}px`,
                    backgroundColor: domain.color.hex,
                  }}
                />
              );
            })}

            {/* Viewport Indicator Rectangle */}
            {(() => {
              const scaleX = 176 / CANVAS_WIDTH;
              const scaleY = 128 / CANVAS_HEIGHT;
              const vpWidth = (containerSize.width / zoom) * scaleX;
              const vpHeight = (containerSize.height / zoom) * scaleY;
              const vpLeft = (-pan.x / zoom) * scaleX;
              const vpTop = (-pan.y / zoom) * scaleY;

              return (
                <div
                  className="absolute border border-purple-400/80 bg-purple-500/15 rounded pointer-events-none transition-all duration-75"
                  style={{
                    left: `${Math.max(0, vpLeft)}px`,
                    top: `${Math.max(0, vpTop)}px`,
                    width: `${Math.min(176, vpWidth)}px`,
                    height: `${Math.min(128, vpHeight)}px`,
                  }}
                />
              );
            })()}

            <span className="absolute bottom-1 right-2 text-[9px] font-mono text-[var(--muted-foreground)] opacity-70">
              Radar
            </span>
          </div>
        </div>

        {/* ─── RIGHT SLIDE-OUT INSPECTOR DRAWER ────────────────────────── */}
        <AnimatePresence>
          {selectedSubtopic && selectedDomain && (
            <m.div
              initial={{ opacity: 0, x: 380 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 380 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 right-0 bottom-0 z-40 w-full sm:w-[440px] bg-[var(--surface-1)] border-l border-[var(--border)] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto pointer-events-auto backdrop-blur-2xl"
            >
              {(() => {
                const linkedConcept = selectedSubtopic.conceptId
                  ? conceptsDb.find((c) => c.id === selectedSubtopic.conceptId)
                  : null;

                return (
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
                        className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                        aria-label="Close details"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Mode Tab Switcher: Concept Card vs Architect Rubric */}
                    <div className="flex items-center p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold">
                      <button
                        onClick={() => setDrawerTab("concept")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all cursor-pointer",
                          drawerTab === "concept"
                            ? "bg-purple-600 text-white shadow-sm"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                      >
                        <BookOpen size={13} />
                        <span>Concept Card</span>
                      </button>
                      <button
                        onClick={() => setDrawerTab("rubric")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all cursor-pointer",
                          drawerTab === "rubric"
                            ? "bg-purple-600 text-white shadow-sm"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                      >
                        <Sparkles size={13} />
                        <span>Architect Rubric</span>
                      </button>
                    </div>

                    {/* VIEW 1: CONCEPT CARD OVERLAY */}
                    {drawerTab === "concept" && (
                      <div className="space-y-5 animate-in fade-in duration-200">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                            {linkedConcept?.category || selectedDomain.shortTitle} · Core Concept
                          </span>
                          <h3 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
                            {linkedConcept?.term || selectedSubtopic.name}
                          </h3>
                        </div>

                        {/* Plain-English Definition */}
                        <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-cyan-500/30 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                            Plain-English Definition
                          </span>
                          <p className="text-xs text-[var(--foreground)] leading-relaxed">
                            {linkedConcept?.definition || selectedSubtopic.desc}
                          </p>
                        </div>

                        {/* Architectural Deep-Dive */}
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                            <Sparkles size={13} className="text-purple-700 dark:text-purple-400" />
                            Architectural Deep-Dive
                          </h4>
                          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                            {linkedConcept?.explanation || selectedSubtopic.tradeOffs}
                          </p>
                        </div>

                        {/* Key Architectural Takeaways */}
                        {linkedConcept?.keyPoints && linkedConcept.keyPoints.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                              Core Takeaways:
                            </h4>
                            <ul className="space-y-1.5">
                              {linkedConcept.keyPoints.map((point, ki) => (
                                <li key={ki} className="flex items-start gap-2 text-xs text-[var(--muted-foreground)]">
                                  <CheckCircle2 size={13} className="text-emerald-700 dark:text-green-400 mt-0.5 shrink-0" />
                                  <span className="leading-snug">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* VIEW 2: ARCHITECT RUBRIC (ORIGINAL VIEW) */}
                    {drawerTab === "rubric" && (
                      <div className="space-y-5 animate-in fade-in duration-200">
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
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                            <Sparkles size={14} />
                            <span>Architectural Trade-Off &amp; Production Rubric</span>
                          </div>
                          <p className="text-xs text-[var(--foreground)] leading-relaxed">
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
                                className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 cursor-pointer"
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
                    )}

                    {/* Drawer Footer Actions */}
                    <div className="pt-6 mt-6 border-t border-[var(--border)] space-y-2">
                      <Link
                        href={
                          selectedSubtopic.conceptId
                            ? `/qa-prep?conceptId=${selectedSubtopic.conceptId}&term=${encodeURIComponent(selectedSubtopic.name)}`
                            : selectedSubtopic.practiceLink
                        }
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 transition-all"
                      >
                        <Zap size={15} />
                        <span>Practice Interview Q&amp;As for this Topic</span>
                        <ArrowRight size={15} />
                      </Link>
                      {linkedConcept && (
                        <Link
                          href={`/concepts?card=${linkedConcept.id}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-cyan-400 text-xs font-semibold transition-colors border border-[var(--border)]"
                        >
                          <BookOpen size={13} />
                          <span>Open in Concepts Library</span>
                        </Link>
                      )}
                      <p className="text-[11px] text-center text-[var(--muted-foreground)]">
                        Filters verified interview questions for this specific architecture node
                      </p>
                    </div>
                  </div>
                );
              })()}
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── MOBILE/TABLET RESPONSIVE VIEW (Screens < 1024px) ─────────── */}
      <div className="block lg:hidden space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white shrink-0">
            <Compass size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--foreground)]">Enterprise Data Stack 2026</h2>
            <p className="text-xs text-[var(--muted-foreground)]">7 Architectural Domains · 28 Core Concepts</p>
          </div>
        </div>

        <div className="space-y-4">
          {MINDMAP_DOMAINS.map((domain) => (
            <div key={domain.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] shadow-md overflow-hidden">
              <div className={cn("p-4 border-b border-[var(--border)] flex items-center justify-between gap-3", domain.color.bg)}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("p-2 rounded-xl border bg-[var(--surface-0)]", domain.color.text, domain.color.border)}>
                    {getDomainIcon(domain.icon, 20)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[var(--foreground)] truncate">{domain.title}</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">{domain.subtopics.length} subtopics</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {domain.subtopics.map((sub) => (
                  <div key={sub.id} className="p-4 space-y-3 hover:bg-[var(--surface-2)] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-[var(--foreground)] mb-1">{sub.name}</h4>
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{sub.desc}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sub.protocols.slice(0, 4).map((p) => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)]">
                          {p}
                        </span>
                      ))}
                      {sub.protocols.length > 4 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg text-[var(--muted-foreground)]">
                          +{sub.protocols.length - 4}
                        </span>
                      )}
                    </div>

                    <Link
                      href={sub.practiceLink}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 mt-2"
                    >
                      <span>Practice Questions</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
