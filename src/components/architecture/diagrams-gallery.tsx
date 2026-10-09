"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Maximize2,
  X,
  Share2,
  Download,
  Check,
  Sparkles,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { architectureDiagrams, ArchitectureDiagramItem } from "@/data";

const CATEGORIES = [
  "All",
  "Fabric & Power BI",
  "Platform Landscape",
  "Data Pipelines & Ingestion",
  "Governance & Security",
  "Storage Engine",
  "Compute & Optimization",
  "Data Modeling & Architecture",
] as const;

export function ArchitectureDiagramsGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDiagram, setActiveDiagram] = useState<ArchitectureDiagramItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDiagram(null);
        setZoomLevel(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredDiagrams = useMemo(() => {
    return architectureDiagrams.filter((item) => {
      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        item.keyPoints.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleShare = (diagram: ArchitectureDiagramItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/architecture?tab=diagrams&diagram=${diagram.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(diagram.id);
    toast.success("Direct link to diagram copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownload = (diagram: ArchitectureDiagramItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = diagram.image;
    link.download = `${diagram.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloading high-resolution diagram");
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search whiteboard diagrams (e.g., Unity Catalog, Liquid Clustering, DLT, Photon, Medallion)..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-purple-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills (Edge-to-edge swipeable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 touch-manipulation",
                isSelected
                  ? "bg-purple-600 border-purple-500 text-white shadow-sm"
                  : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Diagrams Grid (1 Col Mobile, 2 Col Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredDiagrams.map((diagram) => (
          <div
            key={diagram.id}
            id={`diagram-${diagram.id}`}
            onClick={() => {
              setActiveDiagram(diagram);
              setZoomLevel(1);
            }}
            className="group rounded-2xl sm:rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-purple-500/40 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer shadow-sm hover:shadow-xl hover:shadow-purple-500/5"
          >
            {/* Visual Header / Image Container */}
            <div className="relative aspect-video w-full bg-white overflow-hidden border-b border-[var(--border)] flex items-center justify-center">
              <img
                src={diagram.image}
                alt={diagram.title}
                className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-black/75 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 sm:gap-2 shadow-lg">
                  <Maximize2 size={14} /> Tap to Expand High-Res
                </span>
              </div>
              <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3">
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-black/70 backdrop-blur-md text-[9px] sm:text-[10px] font-bold tracking-wider text-purple-300 uppercase border border-white/10">
                  {diagram.category}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors leading-snug">
                      {diagram.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] font-medium mt-0.5">
                      {diagram.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleShare(diagram, e)}
                      className="p-1.5 sm:p-2 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors touch-manipulation"
                      title="Copy link to diagram"
                      aria-label="Copy direct link"
                    >
                      {copiedId === diagram.id ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
                    </button>
                    <button
                      onClick={(e) => handleDownload(diagram, e)}
                      className="p-1.5 sm:p-2 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors touch-manipulation"
                      title="Download image"
                      aria-label="Download image"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed pt-1">
                  {diagram.description}
                </p>

                {/* Key Bullet Highlights */}
                <div className="pt-2 space-y-1.5 border-t border-[var(--border)]">
                  <div className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} className="text-purple-400" /> Key Architectural Pillars
                  </div>
                  <ul className="space-y-1">
                    {diagram.keyPoints.slice(0, 3).map((point, idx) => (
                      <li key={idx} className="text-[11px] text-[var(--muted-foreground)] flex items-start gap-1.5 leading-relaxed">
                        <span className="text-purple-400 font-bold shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tag Badges Footer */}
              <div className="pt-2 flex items-center justify-between border-t border-[var(--border)]">
                <div className="flex flex-wrap gap-1.5">
                  {diagram.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[10px] font-semibold text-[var(--muted-foreground)] border border-[var(--border)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                  Inspect <ChevronRight size={14} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Fullscreen Modal (Mobile Optimized) */}
      {activeDiagram && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200"
          onClick={() => {
            setActiveDiagram(null);
            setZoomLevel(1);
          }}
        >
          <div
            className="relative w-full max-w-6xl max-h-[96vh] sm:max-h-[92vh] bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-4 border-b border-[var(--border)] bg-[var(--surface-2)] gap-2">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-purple-400 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded bg-purple-500/10 border border-purple-500/20 shrink-0">
                    {activeDiagram.category}
                  </span>
                  <h3 className="text-sm sm:text-lg font-bold text-[var(--foreground)] truncate">
                    {activeDiagram.title}
                  </h3>
                </div>
                <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] truncate hidden xs:block">
                  {activeDiagram.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <div className="flex items-center gap-0.5 sm:gap-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg sm:rounded-xl p-0.5 sm:p-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                    className="p-1 sm:p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] touch-manipulation"
                    title="Zoom Out"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <span className="text-[10px] sm:text-xs font-mono px-1 sm:px-2 text-[var(--muted-foreground)] select-none">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                    className="p-1 sm:p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] touch-manipulation"
                    title="Zoom In"
                    aria-label="Zoom In"
                  >
                    <ZoomIn size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1 sm:p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] touch-manipulation hidden sm:inline-flex"
                    title="Reset Zoom"
                    aria-label="Reset Zoom"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>

                <button
                  onClick={(e) => handleDownload(activeDiagram, e)}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-medium touch-manipulation"
                  title="Download image"
                  aria-label="Download image"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  onClick={() => {
                    setActiveDiagram(null);
                    setZoomLevel(1);
                  }}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors touch-manipulation"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body / Image View */}
            <div className="flex-1 overflow-auto p-2 sm:p-6 bg-white flex items-center justify-center min-h-[220px] sm:min-h-[350px] touch-pan-x touch-pan-y">
              <div
                className="transition-transform duration-200 origin-center max-w-full"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={activeDiagram.image}
                  alt={activeDiagram.title}
                  className="max-h-[60vh] sm:max-h-[65vh] w-auto object-contain mx-auto shadow-sm"
                />
              </div>
            </div>

            {/* Modal Footer / Architectural Context (Scrollable on short mobile viewports) */}
            <div className="p-3 sm:p-6 border-t border-[var(--border)] bg-[var(--surface-2)] space-y-2 sm:space-y-3 max-h-[32vh] sm:max-h-none overflow-y-auto">
              <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                {activeDiagram.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-1 border-t border-[var(--border)] text-[11px] sm:text-xs text-[var(--muted-foreground)]">
                {activeDiagram.keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-bold shrink-0">✔</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
