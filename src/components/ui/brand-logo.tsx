import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  showGlow?: boolean;
}

/**
 * Modern Glassmorphic Delta-Core Brand Logo
 * Vibrant Azure-to-Emerald gradient hexagon with dynamic multi-tier lakehouse data layers
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
        {/* Background Gradient */}
        <linearGradient id="bl-lh-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B132B" />
          <stop offset="50%" stopColor="#060913" />
          <stop offset="100%" stopColor="#020408" />
        </linearGradient>

        {/* Border Ring Glow */}
        <linearGradient id="bl-lh-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#38BDF8" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#10B981" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
        </linearGradient>

        {/* Lakehouse Left Pillar (Cyan / Azure Ingestion) */}
        <linearGradient id="bl-lh-pillar-left" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="40%" stopColor="#0284C7" />
          <stop offset="80%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Lakehouse Right Pillar (Emerald / Mint Engine) */}
        <linearGradient id="bl-lh-pillar-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="45%" stopColor="#10B981" />
          <stop offset="85%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Lakehouse Base Foundation (Cobalt / Indigo Storage) */}
        <linearGradient id="bl-lh-base" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="45%" stopColor="#2563EB" />
          <stop offset="75%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Specular Bevel Highlights */}
        <linearGradient id="bl-lh-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
        </linearGradient>

        {/* Photon Gold Core Glow */}
        <radialGradient id="bl-lh-photon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#FDE047" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="85%" stopColor="#D97706" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>

        {/* Ambient Core Glow */}
        <radialGradient id="bl-lh-nebula" cx="50%" cy="52%" r="48%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#059669" stopOpacity="0.25" />
          <stop offset="90%" stopColor="#020408" stopOpacity="0" />
        </radialGradient>

        <filter id="bl-lh-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000000" floodOpacity="0.8" />
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0284C7" floodOpacity="0.4" />
        </filter>

        <filter id="bl-lh-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Squircle Container */}
      <rect width="512" height="512" rx="124" fill="url(#bl-lh-bg)" />
      <rect
        x="6"
        y="6"
        width="500"
        height="500"
        rx="118"
        fill="none"
        stroke="url(#bl-lh-border)"
        strokeWidth="5"
      />
      {showGlow && <circle cx="256" cy="265" r="200" fill="url(#bl-lh-nebula)" />}

      {/* Subtle Architectural Blueprint Lattice */}
      <g opacity="0.25" stroke="url(#bl-lh-border)" strokeWidth="1.8" fill="none">
        <polygon points="256,62 428,161 428,360 256,459 84,360 84,161" />
        <line x1="256" y1="62" x2="256" y2="459" strokeDasharray="4,4" />
        <line x1="84" y1="260" x2="428" y2="260" strokeDasharray="4,4" />
        <circle cx="256" cy="62" r="5" fill="#00F0FF" />
        <circle cx="428" cy="161" r="4.5" fill="#38BDF8" />
        <circle cx="428" cy="360" r="5" fill="#10B981" />
        <circle cx="256" cy="459" r="4.5" fill="#3B82F6" />
        <circle cx="84" cy="360" r="5" fill="#2563EB" />
        <circle cx="84" cy="161" r="4.5" fill="#00F0FF" />
      </g>

      {/* The Architectural Lakehouse Delta Monolith */}
      <g filter="url(#bl-lh-shadow)">
        {/* Arm 1: Left Ingestion Pillar */}
        <polygon points="256,76 304,152 208,322 152,322 96,416 54,342" fill="url(#bl-lh-pillar-left)" />
        <polygon points="256,76 304,152 290,152 256,98" fill="url(#bl-lh-bevel)" />

        {/* Arm 2: Right Engine Pillar */}
        <polygon points="256,76 458,416 394,416 316,278 256,174 256,76" fill="url(#bl-lh-pillar-right)" />
        <polygon points="256,76 458,416 442,416 256,98" fill="url(#bl-lh-bevel)" opacity="0.6" />

        {/* Arm 3: Base Foundation Tier */}
        <polygon points="458,416 394,416 362,360 178,360 146,416 96,416 172,286 236,286 200,344 354,344" fill="url(#bl-lh-base)" />

        {/* Apex Keystone Prism Facet */}
        <polygon points="256,76 288,128 256,174 224,128" fill="#38BDF8" opacity="0.95" />
        <polygon points="256,76 288,128 256,110" fill="#FFFFFF" opacity="0.7" />

        {/* Left Base Anchor Facet */}
        <polygon points="96,416 152,322 202,322 174,374 116,374" fill="#1D4ED8" opacity="0.95" />

        {/* Central Gold Medallion & Photon Spark */}
        <circle cx="256" cy="278" r="36" fill="url(#bl-lh-photon)" filter="url(#bl-lh-glow)" />
        <polygon points="256,236 266,270 300,278 266,286 256,320 246,286 212,278 246,270" fill="#FFFFFF" filter="url(#bl-lh-glow)" />
        <circle cx="256" cy="278" r="5" fill="#F59E0B" />

        {/* Ingestion Stream Data Orbitals */}
        <circle cx="256" cy="116" r="3.5" fill="#FFFFFF" opacity="0.95" />
        <circle cx="348" cy="268" r="3.5" fill="#FFFFFF" opacity="0.95" />
        <circle cx="272" cy="352" r="3.5" fill="#FFFFFF" opacity="0.95" />
        <circle cx="166" cy="312" r="3.5" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* Top-Left Subtle Glass Arc Highlight */}
      <path d="M 32,130 Q 32,32 130,32 Q 256,32 384,32" stroke="url(#bl-lh-bevel)" strokeWidth="2.5" fill="none" opacity="0.45" />
    </svg>
  );
}
