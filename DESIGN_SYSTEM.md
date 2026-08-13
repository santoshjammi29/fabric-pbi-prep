# Fabric & Power BI Prep Design System 2.0 Specification

## 1. Design Token System Specification

### 1.1 Color Tokens (`color`)

```typescript
export const color = {
  surface: {
    base: '#0a0a0a',        // Page background
    raised: '#171717',      // Cards, modals, containers
    overlay: '#262626',     // Hover states, active surfaces
    sunken: '#0f0f0f',      // Code blocks, text inputs
  },
  text: {
    primary: '#fafafa',     // Headings, body primary
    secondary: '#a3a3a3',   // Subheads, labels, metadata
    tertiary: '#737373',    // Captions, subtle metadata
    inverse: '#0a0a0a',     // Light background text
  },
  border: {
    subtle: '#262626',
    default: '#404040',
    strong: '#525252',
    focus: '#3b82f6',
  },
  primary:   { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  secondary: { 500: '#8b5cf6', 600: '#7c3aed' },
  success:   { 500: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  warning:   { 500: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  danger:    { 500: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  info:      { 500: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
};
```

### 1.2 Fluid Typography Scale (`font`)

| Token | Clamp Value | Semantic Role |
| :--- | :--- | :--- |
| `font.size.xs` | `clamp(0.75rem, 0.7rem + 0.2vw, 0.8125rem)` | Captions, small badges |
| `font.size.sm` | `clamp(0.875rem, 0.8rem + 0.3vw, 0.9375rem)` | Secondary text, input text |
| `font.size.base` | `clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)` | Body copy |
| `font.size.lg` | `clamp(1.0625rem, 1rem + 0.3vw, 1.125rem)` | Card titles |
| `font.size.xl` | `clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)` | Section subheaders |
| `font.size.2xl` | `clamp(1.5rem, 1.3rem + 0.8vw, 1.875rem)` | Section titles |
| `font.size.3xl` | `clamp(1.875rem, 1.5rem + 1.5vw, 2.5rem)` | Tab page titles |
| `font.size.4xl` | `clamp(2.25rem, 1.8rem + 2vw, 3.5rem)` | Hero titles |

### 1.3 Spacing Scale (`space`)

`4px` base grid: `0` (0px), `1` (4px), `2` (8px), `3` (12px), `4` (16px), `6` (24px), `8` (32px), `12` (48px), `16` (64px), `24` (96px).

---

## 2. Component Primitives API Reference

### 2.1 Heading
- `display`: Hero titles (`text-4xl`, bold, `text-text-primary`)
- `page`: Page titles (`text-3xl`, bold)
- `section`: Section headers (`text-2xl`, semibold)
- `card`: Card titles (`text-lg`, semibold)

### 2.2 Card
- `compact`: `p-3`, `radius-md`, `border-subtle`, `bg-surface-raised`
- `default`: `p-4`, `radius-lg`, `border-subtle`, `bg-surface-raised`, hover: `border-default`
- `feature`: `p-6`, `radius-xl`, `border-default`, `bg-surface-raised`, `shadow-md`, hover: `shadow-lg`
- `interactive`: `p-4`, `radius-lg`, `border-subtle`, `bg-surface-raised`, hover: `border-primary` + `shadow-glow`

### 2.3 Button
- `primary`: `bg-primary-500`, white text, shadow-md, hover `bg-primary-600`
- `secondary`: transparent bg, text-primary, `border-default`, hover `bg-surface-overlay`
- `ghost`: transparent bg, text-secondary, hover `bg-surface-overlay`
- `danger`: `bg-danger-500`, white text, hover `danger-600`
- Sizes: `sm` (h-8, px-3), `md` (h-10, px-4), `lg` (h-12, px-6)

### 2.4 Badge / Chip / Pill
- `neutral`: `bg-surface-overlay`, `text-secondary`
- `primary`: `bg-primary-500/10`, `text-primary-500`, `border-primary-500/30`
- `success`: `bg-success-bg`, `text-success-500`, `border-success-500/30` (Easy difficulty / Low risk)
- `warning`: `bg-warning-bg`, `text-warning-500`, `border-warning-500/30` (Hard difficulty / Medium risk / NEW / Projected)
- `danger`: `bg-danger-bg`, `text-danger-500`, `border-danger-500/30` (Expert difficulty / High risk / Error)
- `info`: `bg-info-bg`, `text-info-500`, `border-info-500/30` (Medium difficulty)

---

## 3. Lucide Icon System Taxonomy

Functional emojis are replaced with standardized Lucide SVG icons across UI components:
- Engine / Performance: `Zap`
- Learning / Concepts: `BookOpen`
- Code / Practice: `Code2`
- Architecture / Spec: `Landmark`
- AI / RAG: `Bot`
- Streaming / CDC: `Radio`
- Security / Governance: `Lock` / `Shield`
- FinOps / Cost: `DollarSign`
- Open Formats: `Globe` / `Feather`
- Optimizations: `Rocket`
- Tips & Insights: `Lightbulb`
- Search: `Search`
- External Links: `ExternalLink`
- GCC Directory: `Building2`

---

## 4. Breakpoint Layout Matrix

- `375px` & `414px` (Mobile): Single-column stacked cards, full-width inputs, horizontal scroll tabs, 2-col stat tiles.
- `768px` (Tablet): 2-col card grids, stacked mobile GCC tables, 3-col stat tiles.
- `1024px`, `1440px`, `1920px` (Desktop): Multi-column grids (3–5 columns), sticky headers, full data tables, persistent sidebar navigation.
