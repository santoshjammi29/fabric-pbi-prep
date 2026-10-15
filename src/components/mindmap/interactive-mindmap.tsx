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
  LayoutGrid,
  Route,
  GitBranch,
  Eye,
  SlidersHorizontal,
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

/* ─── Balanced Canvas Geometry Dimensions (Legible & Compact) ─────────── */
const CANVAS_WIDTH = 2500;
const CANVAS_HEIGHT = 1650;
const ROOT_X = 1250;
const ROOT_Y = 825;

export function InteractiveMindmap() {
  const containerRef = useRef<HTMLDivElement>(null);

  // View Modes: "canvas" (interactive graph) | "matrix" (7-pillar matrix) | "journey" (lifecycle pipeline)
  const [viewMode, setViewMode] = useState<"canvas" | "matrix" | "journey">("canvas");

  // Transform state: pan & zoom
  const [zoom, setZoom] = useState(0.65);
  const [pan, setPan] = useState({ x: -350, y: -250 });
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
  const [activeJourneyStep, setActiveJourneyStep] = useState<number>(0);
  const [linkedConcept, setLinkedConcept] = useState<{
    id: string;
    term: string;
    category?: string;
    definition: string;
    explanation: string;
    keyPoints?: string[];
  } | null>(null);

  // Fetch linked concept data when a subtopic with conceptId is selected
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

  // Container dimensions tracker
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
      // Prevent browser window from scrolling
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom / trackpad pinch
        const zoomDelta = -e.deltaY * 0.003;
        setZoom((prev) => Math.min(1.8, Math.max(0.4, Number((prev + zoomDelta).toFixed(3)))));
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

  /* ─── Fit to Screen Function ───────────────────────────────────────── */
  const fitToScreen = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const targetZoom = Math.min(
        (clientWidth - 80) / CANVAS_WIDTH,
        (clientHeight - 80) / CANVAS_HEIGHT
      );
      const clampedZoom = Math.max(0.42, Math.min(1.0, Number(targetZoom.toFixed(2))));
      setZoom(clampedZoom);
      setPan({
        x: (clientWidth - CANVAS_WIDTH * clampedZoom) / 2,
        y: (clientHeight - CANVAS_HEIGHT * clampedZoom) / 2,
      });
    }
  }, []);

  /* ─── Initial Center Pan & Zoom on Mount ───────────────────────────── */
  useEffect(() => {
    fitToScreen();
  }, [fitToScreen]);

  /* ─── Reset View / Tidy Up ─────────────────────────────────────────── */
  const resetView = useCallback(() => {
    fitToScreen();
    setSelectedSubtopic(null);
  }, [fitToScreen]);

  const tidyLayout = () => {
    setNodeOffsets({});
    fitToScreen();
    toast.success("Nodes rearranged to clean architectural layout", {
      description: "Subtopics, domain hubs, and flow paths aligned with collision-free spacing.",
    });
  };

  const handleZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.min(1.8, Math.max(0.4, Number((prev + delta).toFixed(2)))));
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
  // Left: Ingestion (top), Storage (mid), Compute (bottom)
  // Right: Orchestration (top), Serving (mid-top), Governance (mid-bottom), AI (bottom)
  const baseLayout = useMemo(() => {
    const positions: Record<
      string,
      {
        x: number;
        y: number;
        subtopics: Array<{ id: string; x: number; y: number }>;
      }
    > = {};

    // LEFT DOMAINS
    const leftBranchX = 780;
    const leftSubtopicX = 330;
    const leftDomainYConfigs = [
      { id: "ingestion", centerY: 350 },
      { id: "storage", centerY: 825 },
      { id: "compute", centerY: 1300 },
    ];

    leftDomainYConfigs.forEach((cfg) => {
      const domain = MINDMAP_DOMAINS.find((d) => d.id === cfg.id);
      if (!domain) return;
      const count = domain.subtopics.length;
      const pitch = 115;
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

    // RIGHT DOMAINS
    const rightBranchX = 1720;
    const rightSubtopicX = 2170;
    const rightDomainYConfigs = [
      { id: "orchestration", centerY: 260 },
      { id: "serving", centerY: 635 },
      { id: "governance", centerY: 1010 },
      { id: "ai", centerY: 1385 },
    ];

    rightDomainYConfigs.forEach((cfg) => {
      const domain = MINDMAP_DOMAINS.find((d) => d.id === cfg.id);
      if (!domain) return;
      const count = domain.subtopics.length;
      const pitch = 115;
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
    <div className="space-y-4">
      {/* ─── TOP PRIMARY CONTROLS & PERSPECTIVE SWITCHER ───────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-md">
        {/* Left: View Mode Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] shrink-0">
          <button
            onClick={() => setViewMode("canvas")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              viewMode === "canvas"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <GitBranch size={14} />
            <span>Interactive Map</span>
          </button>

          <button
            onClick={() => setViewMode("matrix")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              viewMode === "matrix"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <LayoutGrid size={14} />
            <span>7 Pillars Matrix</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-200">
              Scannable
            </span>
          </button>

          <button
            onClick={() => setViewMode("journey")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              viewMode === "journey"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <Route size={14} />
            <span>Lifecycle Pipeline</span>
          </button>
        </div>

        {/* Center: Live Keyword Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts, Kafka, Iceberg, dbt, Spark, CDC..."
            className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-[var(--surface-2)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] border border-[var(--border)] focus:outline-none focus:border-purple-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right: Quick Action Indicators & Counters */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          {searchMatches.size > 0 && (
            <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/25">
              {searchMatches.size} matches found
            </span>
          )}
          <span className="text-xs text-[var(--muted-foreground)] hidden lg:inline">
            7 Domains · 28 Architecture Protocols
          </span>
        </div>
      </div>

      {/* ─── VIEW MODE 1: INTERACTIVE VISUAL CANVAS ───────────────────── */}
      {viewMode === "canvas" && (
        <div
          ref={containerRef}
          className={cn(
            "relative w-full overflow-hidden select-none border border-[var(--border)] bg-[var(--surface-0)] rounded-3xl shadow-2xl transition-all duration-300",
            isFullscreen ? "fixed inset-0 z-50 rounded-none h-dvh w-screen" : "min-h-[640px]"
          )}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          style={{
            cursor: isPanning ? "grabbing" : "grab",
            touchAction: "none",
            height: isFullscreen ? undefined : "clamp(640px, calc(100svh - 180px), 1000px)",
          }}
        >
          {/* Subtle Ambient Background Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-15"
            style={{
              backgroundImage: "radial-gradient(circle, var(--muted-foreground) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Ambient Glow Accents */}
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* ─── CANVAS TOOLBAR (Top Floating Bar) ───────────────────────── */}
          <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
            {/* Domain Quick-Pills */}
            <div className="flex flex-wrap items-center gap-1 bg-[var(--surface-1)]/95 backdrop-blur-xl border border-[var(--border)] p-1 rounded-xl shadow-lg">
              <button
                onClick={() => setActiveFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  activeFilter === "all"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                All 7 Pillars
              </button>
              {MINDMAP_DOMAINS.map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => {
                    const next = domain.id === activeFilter ? "all" : domain.id;
                    setActiveFilter(next);
                    if (next !== "all") {
                      setSelectedDomain(domain);
                      const pos = baseLayout[domain.id];
                      if (pos && containerRef.current) {
                        const cw = containerRef.current.clientWidth;
                        const ch = containerRef.current.clientHeight;
                        setPan({
                          x: cw / 2 - pos.x * zoom,
                          y: ch / 2 - pos.y * zoom,
                        });
                      }
                    }
                  }}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer",
                    activeFilter === domain.id
                      ? `${domain.color.badge} font-bold shadow-xs`
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  <span>{domain.shortTitle}</span>
                </button>
              ))}
            </div>

            {/* Canvas Actions: Flow Mode, Tidy Up, Zoom, Fullscreen */}
            <div className="flex items-center gap-1 bg-[var(--surface-1)]/95 backdrop-blur-xl border border-[var(--border)] p-1 rounded-xl shadow-lg">
              {/* Flow Mode Toggle */}
              <button
                onClick={() => setIsFlowMode(!isFlowMode)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  isFlowMode
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                title="toggle animated architectural data flow"
              >
                <Activity size={13} className={cn(isFlowMode && "text-cyan-400 animate-pulse")} />
                <span className="hidden sm:inline">Data Flow</span>
              </button>

              {/* Tidy Up Auto Align */}
              <button
                onClick={tidyLayout}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer"
                title="auto-organize movable nodes"
              >
                <Sparkles size={13} className="text-purple-400" />
                <span className="hidden sm:inline">Tidy Up</span>
              </button>

              <div className="h-3.5 w-px bg-[var(--border)] mx-0.5" />

              {/* Zoom Controls */}
              <button
                onClick={() => handleZoom(0.12)}
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                title="Zoom In"
                aria-label="Zoom in"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={() => handleZoom(-0.12)}
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                title="Zoom Out"
                aria-label="Zoom out"
              >
                <ZoomOut size={14} />
              </button>

              <span className="text-[11px] font-mono text-[var(--muted-foreground)] px-1 min-w-[2.5rem] text-center">
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={resetView}
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                title="Fit to Screen"
                aria-label="Reset view"
              >
                <RotateCcw size={13} />
              </button>

              <div className="h-3.5 w-px bg-[var(--border)] mx-0.5" />

              <button
                onClick={collapsedDomains.size > 0 ? expandAll : collapseAll}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
              >
                {collapsedDomains.size > 0 ? "Expand" : "Collapse"}
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mindmap"}
                aria-label="Toggle fullscreen"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>

          {/* ─── VIRTUAL CANVAS (Translated & Scaled Plane) ─────────────── */}
          <div
            className="absolute origin-top-left transition-transform duration-75 ease-out"
            style={{
              width: `${CANVAS_WIDTH}px`,
              height: `${CANVAS_HEIGHT}px`,
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            }}
          >
            {/* ─── HIGH-PRECISION SVG CONNECTOR LAYER ───────────────────── */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <style>{`
                  @keyframes flowStreamMove {
                    to { stroke-dashoffset: -32; }
                  }
                  .flow-stream-animated {
                    animation: flowStreamMove 1.4s linear infinite;
                  }
                `}</style>

                {/* Per-domain color gradients */}
                {MINDMAP_DOMAINS.map((domain) => (
                  <linearGradient
                    key={`grad-${domain.id}`}
                    id={`grad-${domain.id}`}
                    x1={domain.side === "left" ? "100%" : "0%"}
                    y1="50%"
                    x2={domain.side === "left" ? "0%" : "100%"}
                    y2="50%"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor={domain.color.hex} stopOpacity="0.9" />
                  </linearGradient>
                ))}

                {/* Flow Sequence Rainbow Stream Gradient */}
                <linearGradient id="flowSeqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="30%" stopColor="#10b981" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="85%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>

              {/* 1. ANIMATED ARCHITECTURAL FLOW PIPELINE */}
              {isFlowMode && flowPathData && (
                <g className="flow-pipeline-layer">
                  {/* Glow outline */}
                  <path
                    d={flowPathData}
                    fill="none"
                    stroke="url(#flowSeqGrad)"
                    strokeWidth={8}
                    strokeOpacity={0.16}
                    strokeLinecap="round"
                  />
                  {/* Animated Dash */}
                  <path
                    d={flowPathData}
                    fill="none"
                    stroke="url(#flowSeqGrad)"
                    strokeWidth={3}
                    strokeDasharray="8 8"
                    strokeLinecap="round"
                    className="flow-stream-animated"
                    strokeOpacity={0.9}
                  />
                </g>
              )}

              {/* 2. ROOT HUB TO DOMAIN CONNECTIONS */}
              {filteredDomains.map((domain) => {
                const pos = layoutNodes[domain.id];
                if (!pos) return null;

                const isLeft = domain.side === "left";
                const rootAnchorX = isLeft ? rootActualX - 160 : rootActualX + 160;
                const rootAnchorY = rootActualY;

                const branchAnchorX = isLeft ? pos.x + 150 : pos.x - 150;
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
                      strokeWidth={isSelected || isMatched ? 4.5 : 2.5}
                      strokeOpacity={isSelected || isMatched ? 0.75 : 0.3}
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
                const branchAnchorX = isLeft ? pos.x - 150 : pos.x + 150;
                const branchAnchorY = pos.y;

                return pos.subtopics.map((subPos) => {
                  const subAnchorX = isLeft ? subPos.x + 140 : subPos.x - 140;
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
                        strokeWidth={isSubSelected || isSubMatched ? 3 : 1.6}
                        strokeOpacity={isSubSelected || isSubMatched ? 0.85 : 0.32}
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
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing"
              style={{ left: `${rootActualX}px`, top: `${rootActualY}px` }}
              onMouseDown={(e) => startNodeDrag("root", e)}
            >
              <div className="relative group p-[2px] rounded-3xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 shadow-2xl">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 to-cyan-600 opacity-30 blur-lg group-hover:opacity-50 transition-opacity" />
                <div className="relative w-80 p-5 rounded-3xl bg-[var(--surface-0)] border border-[var(--border)] flex flex-col items-center text-center space-y-2">
                  <div className="flex items-center gap-1 text-[9px] font-mono text-[var(--muted-foreground)]">
                    <Move size={10} />
                    <span>Movable Central Hub</span>
                  </div>

                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                    <Sparkles size={20} />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Enterprise Data Stack
                    </span>
                    <h2 className="text-lg font-extrabold text-[var(--foreground)] tracking-tight">
                      Modern Data Architecture
                    </h2>
                    <p className="text-[11px] text-[var(--muted-foreground)] leading-tight">
                      7 Core Pillars · 28 Protocols · Lakehouse Engine
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-[10px] font-semibold text-purple-300">
                      Click any node to inspect
                    </span>
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
                    "absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing transition-transform duration-75",
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
                      "w-76 p-3.5 rounded-2xl border transition-all duration-200 shadow-lg group backdrop-blur-xl",
                      isSelected
                        ? `bg-[var(--surface-1)] ${domain.color.border} ring-2 ring-purple-500 shadow-2xl`
                        : isMatched
                        ? `bg-[var(--surface-1)] ${domain.color.border} ring-2 ring-cyan-400 shadow-xl`
                        : "bg-[var(--surface-1)]/95 border-[var(--border)] hover:border-[var(--border-hover)] hover:scale-102"
                    )}
                    style={{
                      boxShadow: isSelected ? `0 0 25px ${domain.color.glow}` : undefined,
                    }}
                  >
                    {/* Top Flow Step Indicator */}
                    {isFlowMode && flowInfo && (
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[var(--border)]/60 text-[10px] font-mono">
                        <span className="font-bold text-cyan-400 flex items-center gap-1">
                          <Activity size={10} className="animate-pulse" />
                          FLOW #{flowInfo.step}
                        </span>
                        <span className="text-[var(--muted-foreground)] text-[9px] truncate max-w-[150px]">
                          {flowInfo.flowRole}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GripVertical
                          size={14}
                          className="text-[var(--muted-foreground)] opacity-40 group-hover:opacity-100 transition-opacity shrink-0"
                        />
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                            domain.color.bg,
                            domain.color.border,
                            domain.color.text
                          )}
                        >
                          {getDomainIcon(domain.icon, 16)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-[var(--foreground)] truncate leading-tight">
                            {domain.title}
                          </h3>
                          <span className="text-[10px] text-[var(--muted-foreground)] font-medium">
                            {domain.subtopics.length} Protocols
                          </span>
                        </div>
                      </div>

                      {/* Expand / Collapse Pill */}
                      <button
                        onClick={(e) => toggleDomainCollapse(domain.id, e)}
                        className="p-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors shrink-0 cursor-pointer"
                        title={isCollapsed ? "Expand Subtopics" : "Collapse Subtopics"}
                        aria-label={isCollapsed ? `Expand ${domain.title}` : `Collapse ${domain.title}`}
                      >
                        {isCollapsed ? (
                          domain.side === "left" ? <ChevronLeft size={13} /> : <ChevronRight size={13} />
                        ) : (
                          <span className="text-[9px] font-mono font-bold px-1 text-purple-400">
                            {domain.subtopics.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ─── LEVEL 2: SUBTOPIC NODES (MOVABLE) ─────────────────────── */}
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
                      "absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing transition-transform duration-75",
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
                        "w-72 p-2.5 rounded-xl border transition-all duration-200 shadow-md group backdrop-blur-md space-y-1.5",
                        isSelected
                          ? `bg-[var(--surface-1)] ${domain.color.border} ring-2 ring-purple-500 shadow-lg scale-102`
                          : highlightedNodeId === sub.id
                          ? "bg-[var(--surface-1)] border-cyan-400 ring-4 ring-cyan-400/80 shadow-2xl animate-pulse scale-102"
                          : isMatched
                          ? "bg-[var(--surface-1)] border-cyan-400 ring-2 ring-cyan-400/60"
                          : "bg-[var(--surface-1)]/95 border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                      )}
                      style={{
                        boxShadow: isSelected ? `0 0 20px ${domain.color.glow}` : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <GripVertical
                            size={12}
                            className="text-[var(--muted-foreground)] opacity-40 group-hover:opacity-100 transition-opacity shrink-0"
                          />
                          <h4 className="text-xs font-bold text-[var(--foreground)] truncate leading-snug">
                            {sub.name}
                          </h4>
                        </div>
                        <ChevronRight
                          size={12}
                          className={cn(
                            "shrink-0 transition-transform",
                            isSelected ? "text-purple-400 translate-x-0.5" : "text-[var(--muted-foreground)]"
                          )}
                        />
                      </div>

                      <p className="text-[10px] text-[var(--muted-foreground)] leading-tight line-clamp-2">
                        {sub.desc}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {sub.protocols.slice(0, 3).map((protocol) => (
                          <span
                            key={protocol}
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)]"
                          >
                            {protocol}
                          </span>
                        ))}
                        {sub.protocols.length > 3 && (
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]">
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

          {/* ─── BOTTOM-LEFT STATUS BAR ───────────────────────────────── */}
          <div className="absolute bottom-3 left-3 z-30 pointer-events-auto bg-[var(--surface-1)]/90 backdrop-blur-xl border border-[var(--border)] px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-semibold text-[var(--foreground)] text-[11px]">Interactive Topography</span>
            <span className="text-[var(--muted-foreground)]">•</span>
            <span className="hidden sm:inline text-[var(--muted-foreground)] text-[11px]">
              Drag Nodes · Mouse Wheel Pan · Pinch Zoom
            </span>
          </div>

          {/* ─── BOTTOM-RIGHT RADAR MINIMAP ───────────────────────────── */}
          <div className="absolute bottom-3 right-3 z-30 pointer-events-auto hidden sm:block">
            <div
              className="w-40 h-28 rounded-xl bg-[var(--surface-1)]/95 backdrop-blur-xl border border-[var(--border)] shadow-xl relative overflow-hidden cursor-crosshair group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                const targetCanvasX = (clickX / 160) * CANVAS_WIDTH;
                const targetCanvasY = (clickY / 112) * CANVAS_HEIGHT;
                setPan({
                  x: containerSize.width / 2 - targetCanvasX * zoom,
                  y: containerSize.height / 2 - targetCanvasY * zoom,
                });
              }}
              title="Radar Minimap — Click to pan canvas"
            >
              {/* Radar Grid */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:6px_6px]" />

              {/* Central Hub Dot */}
              <div
                className="absolute w-2 h-2 rounded-full bg-purple-500 -translate-x-1/2 -translate-y-1/2 shadow-xs"
                style={{
                  left: `${(rootActualX / CANVAS_WIDTH) * 160}px`,
                  top: `${(rootActualY / CANVAS_HEIGHT) * 112}px`,
                }}
              />

              {/* Domain Dots */}
              {MINDMAP_DOMAINS.map((domain) => {
                const pos = layoutNodes[domain.id];
                if (!pos) return null;
                return (
                  <div
                    key={`mm-${domain.id}`}
                    className="absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${(pos.x / CANVAS_WIDTH) * 160}px`,
                      top: `${(pos.y / CANVAS_HEIGHT) * 112}px`,
                      backgroundColor: domain.color.hex,
                    }}
                  />
                );
              })}

              {/* Viewport Bounds Rectangle */}
              {(() => {
                const scaleX = 160 / CANVAS_WIDTH;
                const scaleY = 112 / CANVAS_HEIGHT;
                const vpWidth = (containerSize.width / zoom) * scaleX;
                const vpHeight = (containerSize.height / zoom) * scaleY;
                const vpLeft = (-pan.x / zoom) * scaleX;
                const vpTop = (-pan.y / zoom) * scaleY;

                return (
                  <div
                    className="absolute border border-purple-400 bg-purple-500/15 rounded pointer-events-none transition-all duration-75"
                    style={{
                      left: `${Math.max(0, vpLeft)}px`,
                      top: `${Math.max(0, vpTop)}px`,
                      width: `${Math.min(160, vpWidth)}px`,
                      height: `${Math.min(112, vpHeight)}px`,
                    }}
                  />
                );
              })()}

              <span className="absolute bottom-1 right-1.5 text-[8px] font-mono text-[var(--muted-foreground)] opacity-70">
                Radar
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── VIEW MODE 2: 7 PILLARS ARCHITECTURE MATRIX (SCANNABLE) ────── */}
      {viewMode === "matrix" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
            <span>
              Showing all <strong>7 Enterprise Domains</strong> and <strong>28 Architecture Concepts</strong> side-by-side
            </span>
            <span className="text-purple-400 font-medium">Click any card to inspect rubric &amp; code</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDomains.map((domain, dIdx) => {
              const flowInfo = FLOW_SEQUENCE.find((f) => f.id === domain.id);

              return (
                <div
                  key={domain.id}
                  className={cn(
                    "rounded-2xl border bg-[var(--surface-1)] p-4 shadow-sm flex flex-col justify-between transition-all",
                    selectedDomain?.id === domain.id
                      ? "border-purple-500/50 ring-2 ring-purple-500/30 shadow-md"
                      : "border-[var(--border)] hover:border-[var(--border-hover)]"
                  )}
                >
                  <div className="space-y-3">
                    {/* Domain Header Card */}
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[var(--border)]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                            domain.color.bg,
                            domain.color.border,
                            domain.color.text
                          )}
                        >
                          {getDomainIcon(domain.icon, 16)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono font-bold text-cyan-400 block">
                            STAGE #{flowInfo?.step || `0${dIdx + 1}`}
                          </span>
                          <h3 className="text-sm font-bold text-[var(--foreground)] truncate leading-tight">
                            {domain.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                      {domain.summary}
                    </p>

                    {/* Subtopics List */}
                    <div className="space-y-2 pt-1">
                      {domain.subtopics.map((sub) => {
                        const isSubSelected = selectedSubtopic?.id === sub.id;
                        const isSubMatched = searchMatches.has(sub.id);

                        return (
                          <div
                            key={sub.id}
                            onClick={() => {
                              setSelectedDomain(domain);
                              setSelectedSubtopic(sub);
                            }}
                            className={cn(
                              "p-3 rounded-xl border transition-all cursor-pointer space-y-1.5",
                              isSubSelected
                                ? "bg-[var(--surface-2)] border-purple-500 ring-2 ring-purple-500/30"
                                : isSubMatched
                                ? "bg-[var(--surface-2)] border-cyan-400 ring-2 ring-cyan-400/50"
                                : "bg-[var(--surface-2)]/60 border-[var(--border)] hover:border-purple-500/40 hover:bg-[var(--surface-2)]"
                            )}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <h4 className="text-xs font-bold text-[var(--foreground)] truncate leading-snug">
                                {sub.name}
                              </h4>
                              <ChevronRight size={13} className="text-[var(--muted-foreground)] shrink-0" />
                            </div>

                            <p className="text-[10px] text-[var(--muted-foreground)] leading-snug line-clamp-2">
                              {sub.desc}
                            </p>

                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {sub.protocols.slice(0, 3).map((p) => (
                                <span
                                  key={p}
                                  className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-0)] border border-[var(--border)] text-[var(--foreground)]"
                                >
                                  {p}
                                </span>
                              ))}
                              {sub.protocols.length > 3 && (
                                <span className="text-[9px] font-mono text-[var(--muted-foreground)]">
                                  +{sub.protocols.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── VIEW MODE 3: LIFECYCLE PIPELINE STEPPER ─────────────────── */}
      {viewMode === "journey" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Stepper Navigation Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {FLOW_SEQUENCE.map((seq, idx) => {
              const dom = MINDMAP_DOMAINS.find((d) => d.id === seq.id);
              const isActive = activeJourneyStep === idx;

              return (
                <button
                  key={seq.id}
                  onClick={() => {
                    setActiveJourneyStep(idx);
                    if (dom) {
                      setSelectedDomain(dom);
                      setSelectedSubtopic(dom.subtopics[0]);
                    }
                  }}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 relative overflow-hidden",
                    isActive
                      ? "bg-purple-600/15 border-purple-500 ring-2 ring-purple-500/30"
                      : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={cn("font-bold", isActive ? "text-purple-400" : "text-[var(--muted-foreground)]")}>
                      #{seq.step}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />}
                  </div>
                  <h4 className="text-xs font-bold text-[var(--foreground)] truncate leading-tight">
                    {dom?.shortTitle || seq.stage}
                  </h4>
                  <p className="text-[10px] text-[var(--muted-foreground)] truncate">
                    {seq.flowRole}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Lifecycle Stage Feature Card */}
          {(() => {
            const currentSeq = FLOW_SEQUENCE[activeJourneyStep];
            const currentDomain = MINDMAP_DOMAINS.find((d) => d.id === currentSeq?.id) || MINDMAP_DOMAINS[0];

            return (
              <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xl space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-md",
                        currentDomain.color.bg,
                        currentDomain.color.border,
                        currentDomain.color.text
                      )}
                    >
                      {getDomainIcon(currentDomain.icon, 24)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          PIPELINE STEP #{currentSeq.step} OF 07
                        </span>
                        <span className="text-[var(--muted-foreground)]">•</span>
                        <span className="text-xs text-[var(--muted-foreground)]">{currentSeq.flowRole}</span>
                      </div>
                      <h3 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
                        {currentDomain.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={activeJourneyStep === 0}
                      onClick={() => setActiveJourneyStep((prev) => Math.max(0, prev - 1))}
                      className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--foreground)] disabled:opacity-40 cursor-pointer"
                    >
                      Previous Step
                    </button>
                    <button
                      disabled={activeJourneyStep === FLOW_SEQUENCE.length - 1}
                      onClick={() => setActiveJourneyStep((prev) => Math.min(FLOW_SEQUENCE.length - 1, prev + 1))}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer shadow-md"
                    >
                      Next Step
                    </button>
                  </div>
                </div>

                <p className="text-sm text-[var(--foreground)] leading-relaxed max-w-3xl">
                  {currentDomain.summary}
                </p>

                {/* Subtopic Architecture Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentDomain.subtopics.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setSelectedDomain(currentDomain);
                        setSelectedSubtopic(sub);
                      }}
                      className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/80 hover:border-purple-500/50 hover:bg-[var(--surface-2)] transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-[var(--foreground)]">
                          {sub.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-purple-400">Inspect Rubric →</span>
                      </div>

                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                        {sub.desc}
                      </p>

                      <div className="p-2.5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-xs text-[var(--foreground)] space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-wider">
                          Trade-Off Rationale
                        </span>
                        <p className="text-[11px] text-[var(--muted-foreground)] leading-snug">
                          {sub.tradeOffs}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {sub.protocols.map((p) => (
                          <span
                            key={p}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--surface-1)] border border-[var(--border)] text-[var(--foreground)]"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ─── RIGHT SLIDE-OUT INSPECTOR DRAWER ────────────────────────── */}
      <AnimatePresence>
        {selectedSubtopic && selectedDomain && (
          <m.div
            initial={{ opacity: 0, x: 380 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 380 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[460px] bg-[var(--surface-1)] border-l border-[var(--border)] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto pointer-events-auto backdrop-blur-2xl"
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
                  className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  aria-label="Close details"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mode Tab Switcher: Architect Rubric vs Concept Card */}
              <div className="flex items-center p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold">
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
              </div>

              {/* VIEW 1: ARCHITECT RUBRIC */}
              {drawerTab === "rubric" && (
                <div className="space-y-5 animate-in fade-in duration-200">
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

                  {/* Production Blueprint Snippet */}
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
                      <pre className="p-3.5 rounded-xl bg-black/80 border border-[var(--border)] text-[11px] font-mono text-cyan-300 whitespace-pre-wrap break-words leading-relaxed overflow-x-auto">
                        <code>{selectedSubtopic.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: CONCEPT CARD OVERLAY */}
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

                  {/* Key Takeaways */}
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
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
