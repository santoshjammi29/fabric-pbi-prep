---
name: nextjs-compact-ui
description: |
  Design and refactoring patterns for compact, dense, fast-navigating UI in Next.js data-heavy applications.
  Activate when:
  - A user says a page is "too big", "not compact", "hard to navigate", or "overwhelming"
  - Designing list-heavy pages with 100+ items (Q&A lists, data tables, knowledge bases, concept indexes)
  - Refactoring pages from marketing-style to reference-style layouts
  - Designing multi-level accessible filter decks, dynamic stretching trees/mindmaps, or command palettes
  - The user wants VS Code / terminal aesthetic — dense, keyboard-friendly, scannable

  DO NOT trigger for:
  - Landing pages or marketing pages (they SHOULD be spacious)
  - Dashboard cards with charts (different visual grammar)
---

# Next.js Compact UI Skill

Apply these patterns when building or refactoring data-heavy web applications to make them ultra-dense, scannable, and blazingly fast to navigate in modern Next.js 15/16 App Router applications.

---

## 1. The Core Principle: Reference Portal vs. Marketing Page

| Feature | Marketing Page | Reference Portal (Target) |
|---|---|---|
| **Header** | Large hero section (300-500px) | Single-line header + badge counter (40-60px) |
| **Card Padding** | `p-6` or `p-8` | `px-3 py-1.5` or `px-4 py-2` |
| **Borders & Shadows** | Large blurry dropshadows | Crisp 1px borders (`var(--border)`) |
| **Typography** | `text-base` / `text-lg` prose | `text-xs` / `text-sm` high-contrast monospace/sans |
| **Badges** | Large pill chips (`px-3 py-1 text-xs`) | Micro badges (`px-1.5 py-0.5 text-[10px]`) |
| **Transitions** | Slow 300ms ease-in-out | Snappy 100-150ms transitions |
| **Aesthetic Inspiration** | Stripe / Marketing SaaS | **VS Code / Linear / GitHub Issues / Bloomberg Terminal** |

---

## 2. Multi-Level Unified Filter Deck Pattern (`UnifiedSearchFilterBox`)

Replace single vertical select menus or double-row disjointed scrollbars with an integrated 4-level accessible filter deck:

```tsx
// Structure of UnifiedSearchFilterBox
<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 space-y-3">
  {/* Level 1: Ecosystem / Primary Category Bar */}
  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
    {categories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => setCategory(cat.id)}
        className={cn(
          "px-2.5 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-colors",
          activeCategory === cat.id
            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
            : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        )}
      >
        {cat.name} ({cat.count})
      </button>
    ))}
  </div>

  {/* Search Bar + Keyboard Triggers */}
  <div className="relative flex items-center">
    <Search size={14} className="absolute left-3 text-[var(--muted-foreground)]" />
    <input
      type="text"
      placeholder="Search keywords... (Press / to focus, Esc to clear)"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-9 pr-24 py-1.5 text-xs bg-[var(--surface-1)] border border-[var(--border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
    />
    <div className="absolute right-2 flex items-center gap-1">
      <kbd className="px-1.5 py-0.5 text-[9px] bg-[var(--surface-3)] text-[var(--muted-foreground)] rounded border border-[var(--border)]">
        /
      </kbd>
    </div>
  </div>

  {/* Level 2: Sub-Topics Grid (Responsive Multi-Column Cards) */}
  {subtopics.length > 0 && (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 pt-1 border-t border-[var(--border)]">
      {subtopics.map((sub) => (
        <button
          key={sub.id}
          onClick={() => toggleSubtopic(sub.id)}
          className={cn(
            "flex items-center justify-between px-2 py-1 text-[11px] rounded border transition-all text-left",
            activeSubtopics.includes(sub.id)
              ? "bg-[var(--surface-3)] border-[var(--primary)] text-[var(--foreground)] font-semibold"
              : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-2)]"
          )}
        >
          <span className="truncate">{sub.label}</span>
          <span className="text-[9px] text-[var(--muted-foreground)] ml-1">{sub.count}</span>
        </button>
      ))}
    </div>
  )}

  {/* Level 3 & 4: Difficulty Refinements & Active Filter Chips */}
  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
    <div className="flex items-center gap-1">
      {['ALL', 'EASY', 'MEDIUM', 'HARD', 'ARCHITECT'].map((diff) => (
        <button
          key={diff}
          onClick={() => setDifficulty(diff)}
          className={cn(
            "px-2 py-0.5 text-[10px] rounded font-semibold transition-colors",
            activeDiff === diff
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:bg-[var(--surface-3)]"
          )}
        >
          {diff}
        </button>
      ))}
    </div>

    {hasActiveFilters && (
      <button
        onClick={resetFilters}
        className="text-[10px] text-red-400 hover:text-red-300 font-medium underline underline-offset-2"
      >
        Reset Filters
      </button>
    )}
  </div>
</div>
```

---

## 3. Keyboard-First Accessibility Triggers

Always wire up global and local keyboard listeners to make high-volume portals feel native:
- `/` or `⌘K`: Focus search bar immediately.
- `Escape`: Clear search query, close dropdowns/modals, blur input.
- `Shift + E`: Toggle **Read All Mode** (expands all active question cards for continuous reading).
- `j` / `k` or `ArrowDown` / `ArrowUp`: Move cursor selection up and down items in list views.

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === '/' && document.activeElement !== searchInputRef.current) {
      e.preventDefault();
      searchInputRef.current?.focus();
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      searchInputRef.current?.blur();
    } else if (e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      e.preventDefault();
      toggleReadAllMode();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 4. Ultra-Dense Item Row Pattern (Lists of 100+ Items)

```tsx
// ✅ Compact row — single line, click to expand
<div className="group flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--surface-3)] transition-all duration-150 cursor-pointer border-b border-[var(--border)]">
  {/* Checkbox / Status */}
  <button className="w-3.5 h-3.5 rounded border border-[var(--border)] shrink-0 flex items-center justify-center text-[9px]" />

  {/* Micro Difficulty Badge */}
  <span className={cn(
    "text-[9px] font-mono font-semibold px-1 py-0.2 rounded border shrink-0",
    difficulty === 'ARCHITECT' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
    difficulty === 'HARD' && "bg-rose-500/10 text-rose-400 border-rose-500/20",
    difficulty === 'MEDIUM' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
    difficulty === 'EASY' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  )}>
    {difficulty}
  </span>

  {/* Title — single line truncate */}
  <span className="flex-1 text-xs text-[var(--foreground)] truncate font-medium">
    {title}
  </span>

  {/* Category Pill */}
  <span className="text-[10px] text-[var(--muted-foreground)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded shrink-0">
    {category}
  </span>

  {/* Action icons — only visible on hover */}
  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
    <Bookmark size={12} className="text-[var(--muted-foreground)] hover:text-amber-400" />
    <ExternalLink size={12} className="text-[var(--muted-foreground)]" />
  </div>
</div>

{/* Expanded Body — lazy rendered */}
{isExpanded && (
  <div className="px-8 py-2.5 text-xs text-[var(--muted-foreground)] bg-[var(--surface-1)] border-b border-[var(--border)] space-y-2">
    <p className="leading-relaxed">{answer}</p>
  </div>
)}
```

---

## 5. Dynamic Stretching Mindmap / Tree Pattern

When displaying taxonomic knowledge structures (e.g., 660 concepts across 13 core pillars), implement progressive stretch depth levels:
- **Depth 1: Domain Pillars** (Fabric, Databricks, Spark, Governance, Lakehouse)
- **Depth 2: Sub-Topics** (OneLake, Direct Lake, Unity Catalog, Liquid Clustering)
- **Depth 3: Leaf Concepts** (Compact term chips with difficulty color dots)
- **Depth 4: Deep Inline Mechanisms** (Inline official definition and 3 key takeaways)
- **Layout Switcher**: Offer both Tree Branching (hierarchical SVG lines) and Pillar Card Matrix modes.

---

## 6. Mobile Optimization (Responsive Compactness)

- Never hide essential filters behind 4-click nested sub-menus.
- Use a **slide-up bottom sheet drawer** on screens `<768px` for filter selection.
- Sticky bottom dock navigation bar on mobile for instant 1-thumb switching between Search, Filters, and Read All mode.
- Use `truncate` on table cells and let user tap row to expand full details.
