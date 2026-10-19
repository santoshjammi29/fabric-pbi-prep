import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  showGlow?: boolean;
}

/**
 * Enterprise 3-Tier Medallion Lakehouse Brand Logo
 * Bronze (Raw Foundation), Silver (Conformed Engine), Gold (Curated Marts)
 */
export function BrandLogo({
  size = 32,
  className,
  showGlow = true,
  ...props
}: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={cn("shrink-0 select-none", className)}
      aria-label="Lakehouse Architect Logo"
      role="img"
      {...props}
    >
      <defs>
        {/* Background Canvas */}
        <linearGradient id="bl-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#080E1E" />
          <stop offset="50%" stopColor="#040711" />
          <stop offset="100%" stopColor="#020409" />
        </linearGradient>

        {/* Border Ring */}
        <linearGradient id="bl-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="40%" stopColor="#00F0FF" />
          <stop offset="80%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Tier 3: Gold Top Layer (Curated Marts) */}
        <linearGradient id="bl-gold-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="bl-gold-side" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Tier 2: Cyan Middle Layer (Silver Conformed Engine) */}
        <linearGradient id="bl-cyan-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="bl-cyan-side" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Tier 1: Emerald/Cobalt Bottom Layer (Bronze Lake Foundation) */}
        <linearGradient id="bl-bronze-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="bl-bronze-side" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>

        {/* Central Energy Beam */}
        <linearGradient id="bl-beam" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#FDE047" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#00F0FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.95" />
        </linearGradient>

        <filter id="bl-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="bl-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity="0.7" />
        </filter>
      </defs>

      {/* Container Squircle */}
      <rect width="512" height="512" rx="116" fill="url(#bl-bg)" />
      <rect
        x="8"
        y="8"
        width="496"
        height="496"
        rx="108"
        fill="none"
        stroke="url(#bl-border)"
        strokeWidth="6"
        strokeOpacity="0.85"
      />

      {/* Connecting Central Beam */}
      <line
        x1="256"
        y1="100"
        x2="256"
        y2="410"
        stroke="url(#bl-beam)"
        strokeWidth="12"
        strokeLinecap="round"
        filter={showGlow ? "url(#bl-glow)" : undefined}
      />

      {/* ── 1. BOTTOM TIER: BRONZE / EMERALD FOUNDATION ────────────────── */}
      <g filter={showGlow ? "url(#bl-shadow)" : undefined}>
        <polygon points="96,360 256,430 256,462 96,392" fill="url(#bl-bronze-side)" />
        <polygon points="256,430 416,360 416,392 256,462" fill="#064E3B" />
        <polygon points="256,290 416,360 256,430 96,360" fill="url(#bl-bronze-top)" />
        <circle cx="256" cy="360" r="14" fill="#FFFFFF" filter={showGlow ? "url(#bl-glow)" : undefined} />
      </g>

      {/* ── 2. MIDDLE TIER: SILVER / ELECTRIC CYAN ENGINE ───────────────── */}
      <g filter={showGlow ? "url(#bl-shadow)" : undefined}>
        <polygon points="96,240 256,310 256,342 96,272" fill="url(#bl-cyan-side)" />
        <polygon points="256,310 416,240 416,272 256,342" fill="#075985" />
        <polygon points="256,170 416,240 256,310 96,240" fill="url(#bl-cyan-top)" />
        <circle cx="256" cy="240" r="14" fill="#FFFFFF" filter={showGlow ? "url(#bl-glow)" : undefined} />
      </g>

      {/* ── 3. TOP TIER: GOLD CURATED MARTS ────────────────────────────── */}
      <g filter={showGlow ? "url(#bl-shadow)" : undefined}>
        <polygon points="96,120 256,190 256,222 96,152" fill="url(#bl-gold-side)" />
        <polygon points="256,190 416,120 416,152 256,222" fill="#78350F" />
        <polygon points="256,50 416,120 256,190 96,120" fill="url(#bl-gold-top)" />
        <polygon
          points="256,92 266,114 288,120 266,126 256,148 246,126 224,120 246,114"
          fill="#FFFFFF"
          filter={showGlow ? "url(#bl-glow)" : undefined}
        />
      </g>

      {/* Specular Edge Highlights */}
      <line x1="256" y1="50" x2="96" y2="120" stroke="#FFFFFF" strokeWidth="3" strokeOpacity="0.6" strokeLinecap="round" />
      <line x1="256" y1="170" x2="96" y2="240" stroke="#FFFFFF" strokeWidth="3" strokeOpacity="0.6" strokeLinecap="round" />
      <line x1="256" y1="290" x2="96" y2="360" stroke="#FFFFFF" strokeWidth="3" strokeOpacity="0.6" strokeLinecap="round" />
    </svg>
  );
}
