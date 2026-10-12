"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  X,
  Download,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { architectureDiagrams, ArchitectureDiagramItem } from "@/data";
import { useDiagramTheme } from "@/lib/diagram-theme";
import { WhiteboardCard } from "./whiteboard-card";
import { WhiteboardThemeToggle } from "./whiteboard-theme-toggle";

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
  const [theme] = useDiagramTheme();

  const isDark = theme === "dark";

  // Check URL query param ?diagram=xyz to auto-open or scroll into view
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const diagramParam = params.get("diagram");
      if (diagramParam) {
        const match = architectureDiagrams.find((d) => d.id === diagramParam);
        if (match) {
          setActiveDiagram(match);
          setTimeout(() => {
            const el = document.getElementById(`diagram-${match.id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 150);
        }
      }
    }
  }, []);

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

  const handleDownload = (diagram: ArchitectureDiagramItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = diagram.image;
    link.download = `${diagram.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloading high-resolution blueprint");
  };

  return (
    <div className="space-y-6">
      {/* Search & Global Viewport Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
            className="w-full pl-10 pr-12 py-2.5 sm:py-3 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Global Dark Mode / Light Canvas Option Switch */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hidden md:flex">
            <Sparkles size={13} className="text-blue-500 dark:text-blue-400" />
            <span>Canvas View:</span>
          </div>
          <WhiteboardThemeToggle size="sm" showLabel={true} />
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
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 touch-manipulation cursor-pointer",
                isSelected
                  ? "bg-blue-600 border-blue-500 text-white shadow-xs"
                  : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Diagrams Grid (1 Col Mobile, 2 Col Desktop) using Second Layout Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-7">
        {filteredDiagrams.map((diagram, idx) => (
          <WhiteboardCard
            key={diagram.id}
            diagram={diagram}
            onExpand={(d) => {
              setActiveDiagram(d);
              setZoomLevel(1);
            }}
            priority={idx < 2}
          />
        ))}
      </div>

      {/* Fullscreen High-Resolution Lightbox Modal with Interactive Dark Mode Option */}
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
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 shrink-0">
                    {activeDiagram.category}
                  </span>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--foreground)] truncate">
                    {activeDiagram.title}
                  </h3>
                </div>
                <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] truncate hidden xs:block">
                  {activeDiagram.subtitle}
                </p>
              </div>

              {/* Modal Toolbar: Theme Switch + Zoom + Download + Close */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Whiteboard Theme Toggle inside Modal */}
                <div className="hidden sm:block">
                  <WhiteboardThemeToggle size="xs" showLabel={false} />
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg sm:rounded-xl p-0.5 sm:p-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                    className="p-1 sm:p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] touch-manipulation cursor-pointer"
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
                    className="p-1 sm:p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] touch-manipulation cursor-pointer"
                    title="Zoom In"
                    aria-label="Zoom In"
                  >
                    <ZoomIn size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1 sm:p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] touch-manipulation hidden sm:inline-flex cursor-pointer"
                    title="Reset Zoom"
                    aria-label="Reset Zoom"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>

                <button
                  onClick={(e) => handleDownload(activeDiagram, e)}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-medium touch-manipulation cursor-pointer"
                  title="Download blueprint"
                  aria-label="Download blueprint"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  onClick={() => {
                    setActiveDiagram(null);
                    setZoomLevel(1);
                  }}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors touch-manipulation cursor-pointer"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body / Blueprint View with Dark/Light Mode Filter */}
            <div
              className={cn(
                "flex-1 overflow-auto p-3 sm:p-8 flex items-center justify-center min-h-[240px] sm:min-h-[380px] touch-pan-x touch-pan-y transition-colors duration-300",
                isDark ? "whiteboard-container-dark" : "whiteboard-container-light"
              )}
            >
              <div
                className="transition-transform duration-200 origin-center max-w-full"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <Image
                  src={activeDiagram.image}
                  alt={activeDiagram.title}
                  width={1400}
                  height={788}
                  sizes="(max-width: 768px) 100vw, 85vw"
                  className={cn(
                    "max-h-[60vh] sm:max-h-[66vh] w-auto h-auto object-contain mx-auto shadow-sm transition-all duration-300",
                    isDark ? "whiteboard-dark" : "whiteboard-light"
                  )}
                  priority
                />
              </div>
            </div>

            {/* Modal Footer / Architectural Context */}
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
