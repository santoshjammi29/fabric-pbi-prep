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
  Type,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  MINDMAP_DOMAINS,
  MindmapDomain,
  MindmapSubtopic,
} from "@/data/mindmap-data";

/* ─── High-Contrast Icon Mapper ───────────────────────────────────────── */
function getDomainIcon(name: string, size = 20) {
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
  { id: "ingestion", step: "01", stage: "Ingestion & Streaming", flowRole: "Real-Time Event & CDC Capture" },
  { id: "storage", step: "02", stage: "Storage & Lakehouse", flowRole: "ACID Transactional Open Lake" },
  { id: "compute", step: "03", stage: "Unified Compute", flowRole: "Distributed In-Memory Spark Engine" },
  { id: "orchestration", step: "04", stage: "DataOps & CI/CD", flowRole: "Declarative DAG Orchestration" },
  { id: "serving", step: "05", stage: "Analytical Serving", flowRole: "Zero-Copy Direct Lake Semantic Layer" },
  { id: "governance", step: "06", stage: "Enterprise Governance", flowRole: "Unified Catalog, Security & Lineage" },
  { id: "ai", step: "07", stage: "AI & Vector Retrieval", flowRole: "GenAI RAG & Vector Embeddings Grounding" },
];

/* ─── Canvas Geometry Base Dimensions (High Legibility & Contrast) ────── */
const CANVAS_WIDTH = 2600;
const CANVAS_HEIGHT = 1750;
const ROOT_X = 1300;
const ROOT_Y = 875;

export function InteractiveMindmap() {
  const containerRef = useRef<HTMLDivElement>(null);

  // View Modes:
  // "canvas"  = Interactive 2D graph with pan & zoom (Default for testing & spatial exploration)
  // "roadmap" = Simple, large, high-readability linear roadmap (Optimal for seniors / eye sight)
  // "matrix"  = 7-Pillars comparison board
  const [viewMode, setViewMode] = useState<"canvas" | "roadmap" | "matrix">("canvas");

  // Accessibility: Text Size Scale ("normal" | "large" | "xl")
  const [textSize, setTextSize] = useState<"normal" | "large" | "xl">("large");

  // Transform state: pan & zoom
  const [zoom, setZoom] = useState(0.72);
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
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey) {
        const zoomDelta = -e.deltaY * 0.003;
        setZoom((prev) => Math.min(1.8, Math.max(0.45, Number((prev + zoomDelta).toFixed(3)))));
      } else {
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
      const clampedZoom = Math.max(0.48, Math.min(1.0, Number(targetZoom.toFixed(2))));
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
    setZoom((prev) => Math.min(1.8, Math.max(0.45, Number((prev + delta).toFixed(2)))));
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

  /* ─── Base Positions Math for Canvas ───────────────────────────────── */
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
    const leftBranchX = 820;
    const leftSubtopicX = 350;
    const leftDomainYConfigs = [
      { id: "ingestion", centerY: 360 },
      { id: "storage", centerY: 875 },
      { id: "compute", centerY: 1390 },
    ];

    leftDomainYConfigs.forEach((cfg) => {
      const domain = MINDMAP_DOMAINS.find((d) => d.id === cfg.id);
      if (!domain) return;
      const count = domain.subtopics.length;
      const pitch = 125;
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
    const rightBranchX = 1780;
    const rightSubtopicX = 2250;
    const rightDomainYConfigs = [
      { id: "orchestration", centerY: 280 },
      { id: "serving", centerY: 675 },
      { id: "governance", centerY: 1075 },
      { id: "ai", centerY: 1475 },
    ];

    rightDomainYConfigs.forEach((cfg) => {
      const domain = MINDMAP_DOMAINS.find((d) => d.id === cfg.id);
      if (!domain) return;
      const count = domain.subtopics.length;
      const pitch = 125;
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

  const rootActualX = ROOT_X + (nodeOffsets["root"]?.x || 0);
  const rootActualY = ROOT_Y + (nodeOffsets["root"]?.y || 0);

  const copySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    toast.success("Snippet copied to clipboard");
    setTimeout(() => setHasCopied(false), 2000);
  };

  /* ─── Flow Path Data for Visual Canvas ──────────────────────────────── */
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

  /* ─── Dynamic Font Scale Classes based on textSize ──────────────────── */
  const fontClasses = useMemo(() => {
    if (textSize === "xl") {
      return {
        heading: "text-2xl sm:text-3xl font-black",
        subheading: "text-xl font-bold",
        title: "text-lg font-bold",
        body: "text-base font-normal leading-relaxed",
        subtext: "text-sm font-medium",
        badge: "text-xs font-bold px-3 py-1",
        btn: "text-sm font-bold px-4 py-2.5",
      };
    }
    if (textSize === "large") {
      return {
        heading: "text-xl sm:text-2xl font-extrabold",
        subheading: "text-lg font-bold",
        title: "text-base font-bold",
        body: "text-sm sm:text-base font-normal leading-relaxed",
        subtext: "text-xs sm:text-sm font-medium",
        badge: "text-xs font-bold px-2.5 py-1",
        btn: "text-xs sm:text-sm font-bold px-3.5 py-2",
      };
    }
    return {
      heading: "text-lg sm:text-xl font-bold",
      subheading: "text-base font-bold",
      title: "text-sm font-bold",
      body: "text-xs sm:text-sm font-normal leading-relaxed",
      subtext: "text-xs font-normal",
      badge: "text-[11px] font-semibold px-2 py-0.5",
      btn: "text-xs font-semibold px-3 py-1.5",
    };
  }, [textSize]);

  return (
    <div className="space-y-5">
      {/* ─── ACCESSIBILITY & VIEW CONTROL BAR ───────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--surface-1)] border-2 border-[var(--border)] shadow-md">
        {/* Left: View Mode Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode("canvas")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer",
              viewMode === "canvas"
                ? "bg-purple-600 text-white shadow-md ring-2 ring-purple-400/50"
                : "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] border border-[var(--border)]",
              fontClasses.subtext
            )}
          >
            <GitBranch size={16} />
            <span>1. Visual Topography Map</span>
          </button>

          <button
            onClick={() => setViewMode("roadmap")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer",
              viewMode === "roadmap"
                ? "bg-purple-600 text-white shadow-md ring-2 ring-purple-400/50"
                : "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] border border-[var(--border)]",
              fontClasses.subtext
            )}
          >
            <Route size={16} />
            <span>2. Large Linear Roadmap (Senior Friendly)</span>
          </button>

          <button
            onClick={() => setViewMode("matrix")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer",
              viewMode === "matrix"
                ? "bg-purple-600 text-white shadow-md ring-2 ring-purple-400/50"
                : "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] border border-[var(--border)]",
              fontClasses.subtext
            )}
          >
            <LayoutGrid size={16} />
            <span>3. 7 Pillars Board</span>
          </button>
        </div>

        {/* Center: Live Keyword Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="search concepts (e.g. Kafka, Iceberg, Spark, CDC)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[var(--surface-2)] text-sm font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)] border-2 border-[var(--border)] focus:outline-none focus:border-purple-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer p-1"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Right: Senior Accessibility & Text-Size Scale Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
          {searchMatches.size > 0 && (
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-500/15 px-3 py-1 rounded-xl border border-cyan-500/30">
              {searchMatches.size} matches
            </span>
          )}

          {/* Text Size Scale Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
            <span className="text-xs font-bold text-[var(--muted-foreground)] px-2 flex items-center gap-1">
              <Type size={14} />
              <span className="hidden sm:inline">Text Size:</span>
            </span>
            <button
              onClick={() => setTextSize("normal")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                textSize === "normal"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
              title="Standard text size"
            >
              A
            </button>
            <button
              onClick={() => setTextSize("large")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                textSize === "large"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
              title="Large text size (Senior friendly)"
            >
              A+
            </button>
            <button
              onClick={() => setTextSize("xl")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                textSize === "xl"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
              title="Extra-large high visibility text"
            >
              A++
            </button>
          </div>
        </div>
      </div>

      {/* ─── PRIMARY HEADER BADGE: "Modern Data Architecture" ─────────── */}
      <div className="p-5 rounded-2xl bg-[var(--surface-1)] border-2 border-[var(--border)] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shrink-0">
            <Compass size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                End-to-End Enterprise Stack
              </span>
              <span className="text-[var(--muted-foreground)]">•</span>
              <span className="text-xs font-medium text-[var(--muted-foreground)]">7 Domains · 28 Core Concepts</span>
            </div>
            <h2 className={cn("font-black text-[var(--foreground)] tracking-tight", fontClasses.heading)}>
              Enterprise Platform Architecture
            </h2>
          </div>
        </div>

        {/* Quick Domain Filter Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs",
              activeFilter === "all"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] border border-[var(--border)]"
            )}
          >
            All 7 Domains
          </button>
          {MINDMAP_DOMAINS.map((domain) => (
            <button
              key={domain.id}
              onClick={() => setActiveFilter(domain.id === activeFilter ? "all" : domain.id)}
              className={cn(
                "px-2.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer text-xs flex items-center gap-1",
                activeFilter === domain.id
                  ? `${domain.color.badge} font-bold ring-2 ring-purple-400 shadow-sm`
                  : "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] border border-[var(--border)]"
              )}
            >
              <span>{domain.shortTitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── VIEW MODE 1: INTERACTIVE VISUAL CANVAS (SELECT-NONE BORDER) ─ */}
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
          {/* Background Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, var(--muted-foreground) 1.2px, transparent 1.2px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* ─── CANVAS TOOLBAR (Top Bar) ─────────────────────────────── */}
          <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
            <div className="flex items-center gap-2 bg-[var(--surface-1)] border-2 border-[var(--border)] p-1.5 rounded-2xl shadow-xl">
              <span className="text-xs font-bold text-[var(--foreground)] px-2">Topography Canvas</span>
              <button
                onClick={() => setIsFlowMode(!isFlowMode)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  isFlowMode
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                title="toggle animated architectural data flow"
              >
                <Activity size={14} className={cn(isFlowMode && "text-cyan-400 animate-pulse")} />
                <span>{isFlowMode ? "FLOW #01 Active" : "Data Flow Off"}</span>
              </button>

              <button
                onClick={tidyLayout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--foreground)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-all cursor-pointer"
                title="auto-organize movable nodes"
              >
                <Sparkles size={14} className="text-purple-400" />
                <span>Tidy Up</span>
              </button>
            </div>

            <div className="flex items-center gap-2 bg-[var(--surface-1)] border-2 border-[var(--border)] p-1.5 rounded-2xl shadow-xl">
              <button
                onClick={() => handleZoom(0.15)}
                className="p-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--surface-2)] font-bold cursor-pointer"
                title="Zoom In"
                aria-label="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => handleZoom(-0.15)}
                className="p-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--surface-2)] font-bold cursor-pointer"
                title="Zoom Out"
                aria-label="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs font-mono font-bold text-[var(--foreground)] px-1 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={resetView}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
                title="Fit to Screen"
                aria-label="Reset view"
              >
                Fit Screen
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mindmap"}
                aria-label="Toggle fullscreen"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>

          {/* ─── VIRTUAL CANVAS PLANE ──────────────────────────────────── */}
          <div
            className="absolute origin-top-left transition-transform duration-75 ease-out"
            style={{
              width: `${CANVAS_WIDTH}px`,
              height: `${CANVAS_HEIGHT}px`,
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            }}
          >
            {/* SVG Connectors */}
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
                <linearGradient id="flowSeqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>

              {/* Data Flow Pulse Line */}
              {isFlowMode && flowPathData && (
                <g className="flow-layer">
                  <path
                    d={flowPathData}
                    fill="none"
                    stroke="url(#flowSeqGrad)"
                    strokeWidth={5}
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                    className="flow-stream-animated"
                    strokeOpacity={0.9}
                  />
                </g>
              )}

              {/* Connectors: Root to Domains */}
              {filteredDomains.map((domain) => {
                const pos = layoutNodes[domain.id];
                if (!pos) return null;

                const isLeft = domain.side === "left";
                const rootAnchorX = isLeft ? rootActualX - 170 : rootActualX + 170;
                const rootAnchorY = rootActualY;

                const branchAnchorX = isLeft ? pos.x + 160 : pos.x - 160;
                const branchAnchorY = pos.y;

                const dx = Math.abs(branchAnchorX - rootAnchorX) * 0.55;
                const cx1 = isLeft ? rootAnchorX - dx : rootAnchorX + dx;
                const cx2 = isLeft ? branchAnchorX + dx : branchAnchorX - dx;

                return (
                  <path
                    key={`root-conn-${domain.id}`}
                    d={`M ${rootAnchorX} ${rootAnchorY} C ${cx1} ${rootAnchorY}, ${cx2} ${branchAnchorY}, ${branchAnchorX} ${branchAnchorY}`}
                    fill="none"
                    stroke={domain.color.hex}
                    strokeWidth={4}
                    strokeOpacity={0.5}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Connectors: Domain to Subtopics */}
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

                  return (
                    <path
                      key={`sub-conn-${subPos.id}`}
                      d={`M ${branchAnchorX} ${branchAnchorY} C ${cx1} ${branchAnchorY}, ${cx2} ${subAnchorY}, ${subAnchorX} ${subAnchorY}`}
                      fill="none"
                      stroke={domain.color.hex}
                      strokeWidth={2.5}
                      strokeOpacity={0.45}
                      strokeLinecap="round"
                    />
                  );
                });
              })}
            </svg>

            {/* Central Root Hub Node */}
            <div
              data-node="true"
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing"
              style={{ left: `${rootActualX}px`, top: `${rootActualY}px` }}
              onMouseDown={(e) => startNodeDrag("root", e)}
            >
              <div className="relative group p-1 rounded-3xl bg-gradient-to-r from-purple-600 to-cyan-500 shadow-2xl">
                <div className="relative w-84 p-6 rounded-3xl bg-[var(--surface-0)] border-2 border-[var(--border)] flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Enterprise Data Stack
                  </span>
                  <h2 className="text-xl font-black text-[var(--foreground)] tracking-tight">
                    Modern Data Architecture
                  </h2>
                  <p className="text-xs text-[var(--muted-foreground)] font-medium">
                    7 Core Pillars · 28 Protocols · Lakehouse Engine
                  </p>
                </div>
              </div>
            </div>

            {/* Level 1 Domain Nodes */}
            {filteredDomains.map((domain) => {
              const pos = layoutNodes[domain.id];
              if (!pos) return null;

              const isCollapsed = collapsedDomains.has(domain.id);
              const isSelected = selectedDomain?.id === domain.id;
              const isMatched = searchMatches.has(domain.id);
              const flowInfo = FLOW_SEQUENCE.find((f) => f.id === domain.id);

              return (
                <div
                  key={domain.id}
                  data-node="true"
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing"
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
                      "w-80 p-4 rounded-2xl border-2 transition-all shadow-xl bg-[var(--surface-1)]",
                      isSelected
                        ? "border-purple-500 ring-4 ring-purple-500/40"
                        : isMatched
                        ? "border-cyan-400 ring-4 ring-cyan-400/50"
                        : "border-[var(--border)] hover:border-purple-400"
                    )}
                  >
                    {isFlowMode && flowInfo && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)] text-xs font-mono font-bold">
                        <span className="text-cyan-400 flex items-center gap-1">
                          <Activity size={12} className="animate-pulse" />
                          FLOW #{flowInfo.step}
                        </span>
                        <span className="text-[var(--muted-foreground)] text-[10px]">{flowInfo.flowRole}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("p-2 rounded-xl border-2 shrink-0", domain.color.bg, domain.color.border, domain.color.text)}>
                          {getDomainIcon(domain.icon, 18)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-extrabold text-[var(--foreground)] truncate">
                            {domain.title}
                          </h3>
                          <span className="text-xs text-[var(--muted-foreground)] font-medium">
                            {domain.subtopics.length} Protocols
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => toggleDomainCollapse(domain.id, e)}
                        className="p-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] font-bold text-xs"
                      >
                        {isCollapsed ? "Expand" : domain.subtopics.length}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Level 2 Subtopic Nodes */}
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
                    data-node="true"
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing"
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
                        "w-76 p-3 rounded-2xl border-2 transition-all shadow-md bg-[var(--surface-1)] space-y-1.5",
                        isSelected
                          ? "border-purple-500 ring-4 ring-purple-500/40"
                          : isMatched
                          ? "border-cyan-400 ring-4 ring-cyan-400/50"
                          : "border-[var(--border)] hover:border-purple-400"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-[var(--foreground)] truncate">
                          {sub.name}
                        </h4>
                        <ChevronRight size={14} className="text-purple-400 shrink-0" />
                      </div>

                      <p className="text-[11px] text-[var(--foreground)] opacity-90 line-clamp-2 leading-tight">
                        {sub.desc}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {sub.protocols.slice(0, 3).map((p) => (
                          <span
                            key={p}
                            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)]"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
      )}

      {/* ─── VIEW MODE 2: SIMPLE HIGH-READABILITY LINEAR ROADMAP ────────── */}
      {viewMode === "roadmap" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-between text-sm text-[var(--foreground)]">
            <span className="font-semibold flex items-center gap-2">
              <Eye size={18} className="text-purple-400" />
              <span><strong>Senior High-Readability Mode:</strong> Large text, clear high-contrast cards, and natural vertical scrolling.</span>
            </span>
            <span className="text-xs text-[var(--muted-foreground)] hidden md:inline">Click any card to inspect trade-offs and practice questions</span>
          </div>

          <div className="space-y-8">
            {filteredDomains.map((domain, dIdx) => {
              const flowInfo = FLOW_SEQUENCE.find((f) => f.id === domain.id);

              return (
                <div
                  key={domain.id}
                  className="rounded-3xl border-2 border-[var(--border)] bg-[var(--surface-1)] p-6 sm:p-8 shadow-lg space-y-6 transition-all"
                >
                  {/* Stage Header Banner */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b-2 border-[var(--border)]">
                    <div className="flex items-center gap-4">
                      {/* Big High-Contrast Number Badge */}
                      <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
                        {flowInfo?.step || `0${dIdx + 1}`}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                          <span>PIPELINE STAGE {flowInfo?.step || `0${dIdx + 1}`} OF 07</span>
                          <span>•</span>
                          <span>{flowInfo?.flowRole}</span>
                        </div>
                        <h3 className={cn("font-black text-[var(--foreground)] tracking-tight", fontClasses.subheading)}>
                          {domain.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-xl border font-bold", domain.color.badge, fontClasses.badge)}>
                        {domain.subtopics.length} Architecture Protocols
                      </span>
                    </div>
                  </div>

                  {/* Domain Summary (Large, Readable Body) */}
                  <p className={cn("text-[var(--foreground)] font-medium leading-relaxed max-w-4xl", fontClasses.body)}>
                    {domain.summary}
                  </p>

                  {/* 4 Subtopic Cards in Generous Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
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
                            "rounded-2xl border-2 p-5 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm",
                            isSubSelected
                              ? "bg-[var(--surface-2)] border-purple-500 ring-4 ring-purple-500/30"
                              : isSubMatched
                              ? "bg-[var(--surface-2)] border-cyan-400 ring-4 ring-cyan-400/50"
                              : "bg-[var(--surface-2)]/90 border-[var(--border)] hover:border-purple-400 hover:bg-[var(--surface-2)]"
                          )}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className={cn("text-[var(--foreground)] font-extrabold leading-snug", fontClasses.title)}>
                                {sub.name}
                              </h4>
                              <span className="p-1 rounded-lg bg-[var(--surface-3)] text-purple-400 shrink-0">
                                <ChevronRight size={16} />
                              </span>
                            </div>

                            <p className={cn("text-[var(--foreground)] opacity-90", fontClasses.body)}>
                              {sub.desc}
                            </p>

                            {/* Production Trade-off Callout */}
                            <div className="p-3.5 rounded-xl bg-[var(--surface-0)] border border-amber-500/35 space-y-1">
                              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles size={13} />
                                Architectural Trade-Off
                              </span>
                              <p className={cn("text-[var(--foreground)] font-medium leading-relaxed", fontClasses.subtext)}>
                                {sub.tradeOffs}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                            {/* Standard Protocols Badges */}
                            <div className="flex flex-wrap gap-1.5">
                              {sub.protocols.map((p) => (
                                <span
                                  key={p}
                                  className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-[var(--foreground)]"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>

                            {/* Practice Action Link */}
                            <div className="flex items-center justify-between pt-1">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 hover:text-purple-300 text-sm"
                              >
                                <span>Inspect Full Rubric &amp; Blueprint</span>
                                <ArrowRight size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── VIEW MODE 3: 7 PILLARS COMPARISON BOARD ──────────────────── */}
      {viewMode === "matrix" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDomains.map((domain, dIdx) => (
              <div
                key={domain.id}
                className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface-1)] p-4 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
                    <div className={cn("p-2 rounded-xl border shrink-0", domain.color.bg, domain.color.text)}>
                      {getDomainIcon(domain.icon, 16)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyan-500 block">STAGE 0{dIdx + 1}</span>
                      <h4 className="text-sm font-bold text-[var(--foreground)]">{domain.title}</h4>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--foreground)] opacity-90 leading-relaxed">
                    {domain.summary}
                  </p>

                  <div className="space-y-2 pt-1">
                    {domain.subtopics.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => {
                          setSelectedDomain(domain);
                          setSelectedSubtopic(sub);
                        }}
                        className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-purple-400 transition-all cursor-pointer space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
                          <span>{sub.name}</span>
                          <ChevronRight size={13} className="text-purple-400" />
                        </div>
                        <p className="text-[11px] text-[var(--foreground)] opacity-80 leading-snug line-clamp-2">
                          {sub.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── SLIDE-OUT INSPECTOR DRAWER (LARGE & READABLE) ─────────────── */}
      <AnimatePresence>
        {selectedSubtopic && selectedDomain && (
          <m.div
            initial={{ opacity: 0, x: 420 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 420 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[500px] bg-[var(--surface-1)] border-l-2 border-[var(--border)] shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto pointer-events-auto backdrop-blur-2xl"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-[var(--border)]">
                <span className={cn("rounded-xl border font-bold text-xs px-3 py-1", selectedDomain.color.badge)}>
                  {selectedDomain.shortTitle}
                </span>
                <button
                  onClick={() => setSelectedSubtopic(null)}
                  className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center p-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-bold">
                <button
                  onClick={() => setDrawerTab("rubric")}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer text-center",
                    drawerTab === "rubric" ? "bg-purple-600 text-white shadow-sm" : "text-[var(--foreground)]"
                  )}
                >
                  Architect Rubric
                </button>
                <button
                  onClick={() => setDrawerTab("concept")}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer text-center",
                    drawerTab === "concept" ? "bg-purple-600 text-white shadow-sm" : "text-[var(--foreground)]"
                  )}
                >
                  Concept Card
                </button>
              </div>

              {/* View 1: Architect Rubric */}
              {drawerTab === "rubric" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
                      {selectedSubtopic.name}
                    </h3>
                    <p className="text-base text-[var(--foreground)] leading-relaxed">
                      {selectedSubtopic.desc}
                    </p>
                  </div>

                  {/* Architectural Trade-offs Callout */}
                  <div className="p-5 rounded-2xl bg-[var(--surface-2)] border-2 border-amber-500/40 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-500">
                      <Sparkles size={16} />
                      <span>Architectural Trade-Off &amp; Production Rubric</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--foreground)] leading-relaxed">
                      {selectedSubtopic.tradeOffs}
                    </p>
                  </div>

                  {/* Protocols */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Standard Protocols &amp; Tooling
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubtopic.protocols.map((p) => (
                        <span
                          key={p}
                          className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Code Snippet */}
                  {selectedSubtopic.codeSnippet && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                          Production Blueprint Snippet
                        </span>
                        <button
                          onClick={() => copySnippet(selectedSubtopic.codeSnippet!)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 cursor-pointer"
                        >
                          {hasCopied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{hasCopied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <pre className="p-4 rounded-xl bg-black/90 border border-[var(--border)] text-xs font-mono text-cyan-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                        <code>{selectedSubtopic.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* View 2: Concept Card */}
              {drawerTab === "concept" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      {linkedConcept?.category || selectedDomain.shortTitle} · Core Concept
                    </span>
                    <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
                      {linkedConcept?.term || selectedSubtopic.name}
                    </h3>
                  </div>

                  <div className="p-5 rounded-2xl bg-[var(--surface-2)] border-2 border-cyan-500/40 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Plain-English Definition
                    </span>
                    <p className="text-sm font-medium text-[var(--foreground)] leading-relaxed">
                      {linkedConcept?.definition || selectedSubtopic.desc}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
                      <Sparkles size={15} className="text-purple-400" />
                      Architectural Deep-Dive
                    </h4>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">
                      {linkedConcept?.explanation || selectedSubtopic.tradeOffs}
                    </p>
                  </div>

                  {linkedConcept?.keyPoints && (
                    <div className="space-y-2 pt-3 border-t border-[var(--border)]">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                        Core Takeaways:
                      </h4>
                      <ul className="space-y-2">
                        {linkedConcept.keyPoints.map((point, ki) => (
                          <li key={ki} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                            <CheckCircle2 size={16} className="text-green-400 mt-0.5 shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-6 border-t-2 border-[var(--border)] space-y-3">
                <Link
                  href={
                    selectedSubtopic.conceptId
                      ? `/qa-prep?conceptId=${selectedSubtopic.conceptId}&term=${encodeURIComponent(selectedSubtopic.name)}`
                      : selectedSubtopic.practiceLink
                  }
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-lg transition-all"
                >
                  <Zap size={16} />
                  <span>Practice Interview Q&amp;As for this Topic</span>
                  <ArrowRight size={16} />
                </Link>
                {linkedConcept && (
                  <Link
                    href={`/concepts?card=${linkedConcept.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-cyan-400 text-sm font-semibold border border-[var(--border)] transition-colors"
                  >
                    <BookOpen size={15} />
                    <span>Open in Concepts Library</span>
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
