"use client";

import React, { useRef, useEffect, useCallback } from "react";
import {
  MindmapDomain,
  MindmapSubtopic,
} from "@/data/mindmap-data";

interface NodePosition {
  x: number;
  y: number;
  subtopics: Array<{ id: string; x: number; y: number }>;
}

export interface MindmapCanvasEngineProps {
  domains: MindmapDomain[];
  layoutNodes: Record<string, NodePosition>;
  rootPos: { x: number; y: number };
  zoom: number;
  pan: { x: number; y: number };
  isFlowMode: boolean;
  selectedDomain: MindmapDomain | null;
  selectedSubtopic: MindmapSubtopic | null;
  searchMatches: Set<string>;
  collapsedDomains: Set<string>;
  onSelectDomain: (domain: MindmapDomain) => void;
  onSelectSubtopic: (subtopic: MindmapSubtopic, domain: MindmapDomain) => void;
  onPanChange: (newPan: { x: number; y: number }) => void;
  onNodeDrag?: (nodeId: string, deltaX: number, deltaY: number) => void;
}

const FLOW_SEQUENCE = [
  { id: "ingestion", step: "01", stage: "Ingestion & Streaming" },
  { id: "storage", step: "02", stage: "Storage & Lakehouse" },
  { id: "compute", step: "03", stage: "Unified Compute" },
  { id: "orchestration", step: "04", stage: "DataOps & CI/CD" },
  { id: "serving", step: "05", stage: "Analytical Serving" },
  { id: "governance", step: "06", stage: "Enterprise Governance" },
  { id: "ai", step: "07", stage: "AI & Vector Retrieval" },
];

export function MindmapCanvasEngine({
  domains,
  layoutNodes,
  rootPos,
  zoom,
  pan,
  isFlowMode,
  selectedDomain,
  selectedSubtopic,
  searchMatches,
  collapsedDomains,
  onSelectDomain,
  onSelectSubtopic,
  onPanChange,
}: MindmapCanvasEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const flowOffsetRef = useRef<number>(0);

  // Helper to draw rounded rectangle
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Main 60 FPS Render Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply Viewport Pan and Zoom
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1. Draw Architectural Data Flow Pipeline (if flow mode active)
    if (isFlowMode) {
      flowOffsetRef.current = (flowOffsetRef.current + 0.5) % 40;
      const points: Array<{ x: number; y: number }> = [];
      FLOW_SEQUENCE.forEach((item) => {
        const p = layoutNodes[item.id];
        if (p) points.push({ x: p.x, y: p.y });
      });

      if (points.length >= 2) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const mx = (p1.x + p2.x) / 2;
          ctx.bezierCurveTo(mx, p1.y, mx, p2.y, p2.x, p2.y);
        }

        // Glow stroke
        ctx.lineWidth = 10;
        ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
        ctx.lineCap = "round";
        ctx.stroke();

        // Animated dashed stream
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(6, 182, 212, 0.85)";
        ctx.setLineDash([12, 10]);
        ctx.lineDashOffset = -flowOffsetRef.current;
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. Draw Connectors: Root Hub -> Domains
    domains.forEach((domain) => {
      const pos = layoutNodes[domain.id];
      if (!pos) return;

      const isLeft = domain.side === "left";
      const rootAnchorX = isLeft ? rootPos.x - 180 : rootPos.x + 180;
      const rootAnchorY = rootPos.y;
      const branchAnchorX = isLeft ? pos.x + 160 : pos.x - 160;
      const branchAnchorY = pos.y;
      const dx = Math.abs(branchAnchorX - rootAnchorX) * 0.55;
      const cx1 = isLeft ? rootAnchorX - dx : rootAnchorX + dx;
      const cx2 = isLeft ? branchAnchorX + dx : branchAnchorX - dx;

      const isSel = selectedDomain?.id === domain.id;
      const isMat = searchMatches.has(domain.id);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(rootAnchorX, rootAnchorY);
      ctx.bezierCurveTo(cx1, rootAnchorY, cx2, branchAnchorY, branchAnchorX, branchAnchorY);
      ctx.lineWidth = isSel || isMat ? 5 : 2.5;
      ctx.strokeStyle = isSel || isMat ? domain.color.hex : `${domain.color.hex}66`;
      ctx.stroke();
      ctx.restore();

      // Connectors: Domain -> Subtopics
      if (!collapsedDomains.has(domain.id)) {
        pos.subtopics.forEach((subPos) => {
          const subAnchorX = isLeft ? subPos.x + 145 : subPos.x - 145;
          const subAnchorY = subPos.y;
          const sdx = Math.abs(subAnchorX - branchAnchorX) * 0.5;
          const scx1 = isLeft ? branchAnchorX - sdx : branchAnchorX + sdx;
          const scx2 = isLeft ? subAnchorX + sdx : subAnchorX - sdx;

          const isSubSel = selectedSubtopic?.id === subPos.id;
          const isSubMat = searchMatches.has(subPos.id);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(branchAnchorX, branchAnchorY);
          ctx.bezierCurveTo(scx1, branchAnchorY, scx2, subAnchorY, subAnchorX, subAnchorY);
          ctx.lineWidth = isSubSel || isSubMat ? 3.5 : 1.5;
          ctx.strokeStyle = isSubSel || isSubMat ? domain.color.hex : `${domain.color.hex}44`;
          ctx.stroke();
          ctx.restore();
        });
      }
    });

    ctx.restore();

    animFrameRef.current = requestAnimationFrame(render);
  }, [
    domains,
    layoutNodes,
    rootPos,
    zoom,
    pan,
    isFlowMode,
    selectedDomain,
    selectedSubtopic,
    searchMatches,
    collapsedDomains,
  ]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.parentElement.clientWidth * dpr;
      canvas.height = canvas.parentElement.clientHeight * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
