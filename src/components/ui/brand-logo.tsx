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
      aria-label="DataPlatform Architect Logo"
      role="img"
      {...props}
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id="bl-bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0E1726" />
          <stop offset="50%" stopColor="#090D16" />
          <stop offset="100%" stopColor="#03060C" />
        </linearGradient>

        {/* Glassmorphic Border Glow */}
        <linearGradient id="bl-borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#0284C7" stopOpacity="0.3" />
          <stop offset="70%" stopColor="#10B981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
        </linearGradient>

        {/* Ambient Core Glow */}
        <radialGradient id="bl-ambientNebula" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
          <stop offset="45%" stopColor="#059669" stopOpacity="0.2" />
          <stop offset="85%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Lakehouse Arm 1: Azure Compute & Ingestion */}
        <linearGradient id="bl-armAzure" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="40%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Lakehouse Arm 2: Emerald Curated & Direct Lake */}
        <linearGradient id="bl-armEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Lakehouse Arm 3: Cobalt Storage & ACID Delta Core */}
        <linearGradient id="bl-armCobalt" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="25%" stopColor="#0D9488" />
          <stop offset="70%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* 3D Bevel Highlights */}
        <linearGradient id="bl-bevelLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
        </linearGradient>

        {/* Central Photon Spark */}
        <radialGradient id="bl-photonSpark" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#E0F2FE" />
          <stop offset="60%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>

        {/* Drop Shadow Filter */}
        <filter id="bl-deltaShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#000000" floodOpacity="0.7" />
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0284C7" floodOpacity="0.35" />
        </filter>

        <filter id="bl-sparkGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Container Squircle Background */}
      <rect width="512" height="512" rx="120" fill="url(#bl-bgGrad)" />
      <rect
        x="5"
        y="5"
        width="502"
        height="502"
        rx="115"
        fill="none"
        stroke="url(#bl-borderGrad)"
        strokeWidth="4.5"
      />
      {showGlow && <circle cx="256" cy="256" r="195" fill="url(#bl-ambientNebula)" />}

      {/* Outer Tech Circuit Geometry */}
      <g opacity="0.35" stroke="url(#bl-borderGrad)" strokeWidth="2" fill="none">
        <polygon points="256,66 420,161 420,351 256,446 92,351 92,161" />
        <line x1="256" y1="66" x2="256" y2="100" strokeDasharray="3,3" />
        <line x1="420" y1="351" x2="390" y2="335" strokeDasharray="3,3" />
        <line x1="92" y1="351" x2="122" y2="335" strokeDasharray="3,3" />
        <circle cx="256" cy="66" r="5" fill="#38BDF8" />
        <circle cx="420" cy="161" r="4" fill="#38BDF8" />
        <circle cx="420" cy="351" r="5" fill="#10B981" />
        <circle cx="256" cy="446" r="4" fill="#10B981" />
        <circle cx="92" cy="351" r="5" fill="#2563EB" />
        <circle cx="92" cy="161" r="4" fill="#38BDF8" />
      </g>

      {/* Master Interlocking Delta-Core Emblem */}
      <g filter="url(#bl-deltaShadow)">
        {/* Arm 1: Azure Compute & Ingestion */}
        <path
          d="M 256,86 L 296,155 L 204,314 L 156,314 L 106,400 L 66,331 Z"
          fill="url(#bl-armAzure)"
        />
        <path d="M 256,86 L 296,155 L 284,155 L 256,106 Z" fill="url(#bl-bevelLight)" />

        {/* Arm 2: Emerald Analytics & Direct Lake */}
        <path
          d="M 256,86 L 446,400 L 386,400 L 310,270 L 256,176 L 256,86 Z"
          fill="url(#bl-armEmerald)"
        />
        <path
          d="M 256,86 L 446,400 L 432,400 L 256,106 Z"
          fill="url(#bl-bevelLight)"
          opacity="0.6"
        />

        {/* Arm 3: Delta ACID & Foundation Layer */}
        <path
          d="M 446,400 L 386,400 L 356,348 L 176,348 L 146,400 L 106,400 L 176,280 L 236,280 L 204,334 L 348,334 L 386,400 Z"
          fill="url(#bl-armCobalt)"
        />

        {/* Dynamic Continuous Prism Overlap Facet */}
        <path d="M 256,86 L 282,132 L 256,176 L 230,132 Z" fill="#38BDF8" opacity="0.9" />
        <path
          d="M 106,400 L 156,314 L 204,314 L 176,364 L 124,364 Z"
          fill="#1D4ED8"
          opacity="0.95"
        />

        {/* Central Photon Spark */}
        <circle cx="256" cy="276" r="32" fill="url(#bl-photonSpark)" filter="url(#bl-sparkGlow)" />
        <polygon
          points="256,242 278,276 256,310 234,276"
          fill="#FFFFFF"
          filter="url(#bl-sparkGlow)"
        />
        <circle cx="256" cy="276" r="4" fill="#0EA5E9" />

        {/* Streaming Data Dots */}
        <circle cx="256" cy="120" r="3" fill="#FFFFFF" opacity="0.9" />
        <circle cx="340" cy="265" r="3.5" fill="#FFFFFF" opacity="0.9" />
        <circle cx="270" cy="341" r="3" fill="#FFFFFF" opacity="0.9" />
        <circle cx="170" cy="305" r="3" fill="#FFFFFF" opacity="0.9" />
      </g>

      {/* Top Specular Sweep */}
      <path
        d="M 30,120 Q 30,30 120,30 Q 256,30 380,30"
        stroke="url(#bl-bevelLight)"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}
