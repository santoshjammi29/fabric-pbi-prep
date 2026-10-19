# Standardized Architecture & Developer Guide

## 1. Overview & Core Philosophy

**DataPlatform Architect** (`lakehousearchitect.vercel.app`) is engineered for high-performance, real-time global access by thousands of concurrent engineers, architects, and interview candidates.

To guarantee zero latency worldwide and seamless future maintenance, the codebase adheres to four architectural invariants:

1. **Strict Server/Client Boundary**: Every page uses a Server Component entry point (`page.tsx`) for metadata, SEO, and edge caching (ISR), paired with an interactive Client Component (`*-client.tsx`).
2. **Central Source of Truth**: All platform constants, brand metadata, caching rules, and UI presets reside in `src/config/platform.config.ts`.
3. **Data Access Layer (DAL)**: All datasets are queried through `src/lib/dal.ts` with React `cache()` request deduplication.
4. **Zero-Lag Continuous Reading Mode**: All card-centric views support instant "Read All" (`Shift + E`) with $O(1)$ inverse Set evaluation.

---

## 2. Directory Layout & Roles

```text
src/
├── app/                           # App Router routes (14 static ISR pages)
│   ├── qa-prep/
│   │   ├── page.tsx               # Server Component (ISR, metadata, JSON-LD, Suspense)
│   │   └── qa-prep-client.tsx     # Client Component (Virtualizer, Read All, filters)
│   ├── concepts/
│   │   ├── page.tsx
│   │   └── concepts-client.tsx
│   ├── architecture/
│   │   ├── page.tsx
│   │   └── architecture-client.tsx
│   ├── guided-learning/
│   │   ├── page.tsx
│   │   └── guided-learning-client.tsx
│   └── studio/
│       ├── page.tsx
│       └── studio-client.tsx
├── config/
│   └── platform.config.ts         # Single Source of Truth for brand, caching, & hubs
├── types/
│   ├── index.ts                   # Central barrel export
│   ├── data.ts                    # Core platform domain entities
│   └── progress.ts                # Study tracker state models
├── data/
│   ├── index.ts                   # Strong-typed dataset access
│   ├── json/                      # Raw JSON knowledge bases
│   ├── diagrams.ts                # 32 Whiteboard architecture blueprints
│   ├── navigation-data.ts         # Navigation items & hierarchies
│   └── guided-learning-topics.ts  # Curriculum topics & milestones
├── lib/
│   ├── dal.ts                     # Server-side Data Access Layer (React cache())
│   ├── seo.ts                     # Schema.org & OpenGraph generators
│   └── utils.ts                   # Utility functions & class merger
└── components/
    ├── layout/                    # Header, Footer, Subnav, Navigation
    ├── ui/                        # Reusable glassmorphic cards, accordions, badges
    └── architecture/              # Lightbox, diagrams gallery
```

---

## 3. The Standard App Route Pattern

When creating a new route or modifying an existing one, always follow this standard 2-file pattern:

### 1. `src/app/[route]/page.tsx` (Server Component)
```tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { MyRouteClient } from "./my-route-client";
import { buildPageMetadata, generateCourseSchema } from "@/lib/seo";

// 1-Hour Incremental Static Regeneration at Edge CDN
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Feature Title",
    description: "Feature description for Google & Twitter cards.",
    path: "/my-route",
    keywords: ["Relevant", "Keywords"],
  });
}

export default async function MyRoutePage() {
  // 1. Fetch server data using DAL (deduplicated by React cache())
  const data = await getMyDataDAL();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MyRouteClient initialData={data} />
    </Suspense>
  );
}
```

### 2. `src/app/[route]/my-route-client.tsx` (Client Component)
```tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
// Import interactive state, TanStack virtualizer, or Read All mode handlers
```

---

## 4. How to Add or Modify Content

### Adding a New Architecture Whiteboard Diagram
1. Add the SVG or WebP diagram file to `public/diagrams/<id>.webp`.
2. Open `src/data/diagrams.ts` and add a new entry to `architectureDiagrams` with `id`, `title`, `category`, `image`, and `keyPoints`.
3. The diagram will automatically render in the Whiteboard Gallery (`/architecture?tab=diagrams`), Guided Learning lightboxes, and SEO schemas.

### Adding New Q&A or Concept Entries
1. Add structured entries to `src/data/json/questions.json` or `src/data/json/data_concepts.json`.
2. The DAL (`src/lib/dal.ts`) automatically validates and indexes the new items during build time and ISR revalidation.

---

## 5. Global Production Speed Architecture

- **Next.js 16 Static Regeneration**: All 25 routes pre-compile into static HTML/JSON with a 1-hour ISR revalidation window (`revalidate = 3600`).
- **Edge CDN Optimization**:
  - `Cache-Control: public, max-age=31536000, immutable` for static and hashed bundles.
  - `Cache-Control: public, max-age=31536000, stale-while-revalidate=86400, immutable` for diagrams and icons.
  - `compress: true` for Brotli/Gzip wire transfer compression.
  - Image optimization via modern AVIF/WebP formats with 1-year CDN TTL.
- **Zero-Stutter Virtualization**: TanStack virtualizer combined with $O(1)$ Read All lookups guarantees 60 FPS scrolling across 6,500+ items.
