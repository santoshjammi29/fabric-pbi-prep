"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  ExternalLink,
} from "lucide-react";

interface PosterLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  posterUrl: string;
  title: string;
  subtitle?: string;
  pdfUrl?: string;
}

export function PosterLightbox({
  isOpen,
  onClose,
  posterUrl,
  title,
  subtitle,
  pdfUrl,
}: PosterLightboxProps) {
  const [zoom, setZoom] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset zoom on open
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
    }
  }, [isOpen, posterUrl]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setZoom(1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="poster-dialog-title"
      className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#080c15]/90 text-white shrink-0">
        <div className="min-w-0 pr-4">
          <h2 id="poster-dialog-title" className="text-sm sm:text-base font-bold truncate">
            {title}
          </h2>
          <p className="text-[11px] text-slate-400 truncate">
            {subtitle || "Panoramic Dual-Page Wall Poster • 4162 × 2924 • 250 DPI High-Res"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              disabled={zoom <= 0.5}
              className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-slate-300 min-w-11 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              disabled={zoom >= 2.5}
              className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset zoom"
              title="Reset zoom"
              className="p-1.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Download Full Poster */}
          <a
            href={posterUrl}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Download Poster</span>
            <span className="sm:hidden">Download</span>
          </a>

          {/* Download PDF option if available */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              download
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download size={13} className="text-sky-400" />
              <span>Vector PDF</span>
            </a>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close poster viewer"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        ref={containerRef}
        onClick={onClose}
        className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center cursor-zoom-out"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative transition-transform duration-150 ease-out cursor-default shadow-2xl rounded-lg overflow-hidden border border-slate-800 max-w-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterUrl}
            alt={title}
            className="w-auto h-auto max-h-[82vh] max-w-[94vw] object-contain rounded-lg"
          />
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="px-4 py-2 border-t border-slate-900 bg-[#080c15]/90 text-center text-[11px] text-slate-500">
        <span>Click anywhere outside the poster or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">ESC</kbd> to close.</span>
      </div>
    </div>
  );
}
