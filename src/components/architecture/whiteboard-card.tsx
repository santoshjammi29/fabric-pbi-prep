"use client";

import React from "react";
import Image from "next/image";
import { Maximize2, Share2, Download, Check, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ArchitectureDiagramItem } from "@/data/diagrams";
import { useDiagramTheme } from "@/lib/diagram-theme";

interface WhiteboardCardProps {
  diagram: ArchitectureDiagramItem;
  onExpand?: (diagram: ArchitectureDiagramItem) => void;
  className?: string;
  showDetails?: boolean;
  priority?: boolean;
}

export function WhiteboardCard({
  diagram,
  onExpand,
  className,
  showDetails = true,
  priority = false,
}: WhiteboardCardProps) {
  const [theme] = useDiagramTheme();
  const [copied, setCopied] = React.useState(false);

  const isDark = theme === "dark";

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/architecture?tab=diagrams&diagram=${diagram.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Direct link to blueprint copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = diagram.image;
    link.download = `${diagram.id}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${diagram.title}`);
  };

  const handleCardClick = () => {
    if (onExpand) {
      onExpand(diagram);
    }
  };

  return (
    <div
      id={`diagram-${diagram.id}`}
      onClick={handleCardClick}
      className={cn(
        "group rounded-2xl sm:rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-blue-500/40 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/5 scroll-mt-20",
        className
      )}
    >
      {/* Visual Canvas Container - Clean, Pristine Whiteboard View without Obstructive Overlays */}
      <div
        className={cn(
          "relative aspect-[16/10] w-full overflow-hidden border-b border-[var(--border)] flex items-center justify-center p-3 sm:p-5 select-none transition-colors duration-300",
          isDark ? "whiteboard-container-dark" : "whiteboard-container-light"
        )}
      >
        {/* Diagram Image with Hardware-Accelerated Theme Transition */}
        <div className="relative w-full h-full min-h-[220px] flex items-center justify-center">
          <Image
            src={diagram.image}
            alt={diagram.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-contain transition-transform duration-500 group-hover:scale-[1.018]",
              isDark ? "whiteboard-dark" : "whiteboard-light"
            )}
            priority={priority}
          />
        </div>
      </div>

      {/* Content Details */}
      {showDetails && (
        <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    {diagram.category}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {diagram.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] font-medium mt-0.5">
                  {diagram.subtitle}
                </p>
              </div>

              <div
                className="flex items-center gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handleCardClick}
                  className="p-1.5 sm:p-2 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors touch-manipulation cursor-pointer"
                  title="Inspect Full Blueprint"
                  aria-label="Inspect Full Blueprint"
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-1.5 sm:p-2 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors touch-manipulation cursor-pointer"
                  title="Copy link to blueprint"
                  aria-label="Copy direct link"
                >
                  {copied ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Share2 size={16} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 sm:p-2 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors touch-manipulation cursor-pointer"
                  title="Download blueprint image"
                  aria-label="Download blueprint image"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed pt-1">
              {diagram.description}
            </p>

            {/* Key Pillars Highlights */}
            {diagram.keyPoints && diagram.keyPoints.length > 0 && (
              <div className="pt-2.5 space-y-1.5 border-t border-[var(--border)]">
                <div className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-blue-500 dark:text-blue-400" /> Key Architectural Pillars
                </div>
                <ul className="space-y-1">
                  {diagram.keyPoints.slice(0, 3).map((point, idx) => (
                    <li
                      key={idx}
                      className="text-[11px] text-[var(--muted-foreground)] flex items-start gap-1.5 leading-relaxed"
                    >
                      <span className="text-blue-500 dark:text-blue-400 font-bold shrink-0">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer tags and Inspect button */}
          <div className="pt-2 flex items-center justify-between border-t border-[var(--border)]">
            <div className="flex flex-wrap gap-1.5">
              {diagram.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[10px] font-semibold text-[var(--muted-foreground)] border border-[var(--border)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
              Inspect <ChevronRight size={14} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
