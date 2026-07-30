# DE.UNIVERSE — Editorial Knowledge Graph Documentation

## 1. Design Rationale
`DE.UNIVERSE` (`/data-engineering-mindmap`) is built with an editorial, data-dense, quiet aesthetic inspired by Linear, Stripe Docs, Vercel, and Apple Newsroom. The interface avoids visual clutter, cartoonish colors, bouncy animations, background particle stars, and emojis. Every element uses a strict 12-column grid, 8px vertical rhythm, hairline 1px borders (`#15171C`), and a single desaturated accent (`#7C9CFF`).

---

## 2. Motion Specification
- **Easing Tokens**:
  - `--ease-out-soft`: `cubic-bezier(0.22, 1, 0.36, 1)`
  - `--ease-out-fast`: `cubic-bezier(0.32, 0.72, 0, 1)`
  - `--ease-in-out`: `cubic-bezier(0.65, 0, 0.35, 1)`
- **Duration Tokens**:
  - `--dur-instant`: `80ms` (colors, opacity)
  - `--dur-quick`: `180ms` (hover, small UI)
  - `--dur-base`: `280ms` (panels, inspector slide)
  - `--dur-emphasis`: `480ms` (camera pan/zoom)
  - `--dur-narrative`: `800ms` (initial entrance)
- **Reduced Motion**: `@media (prefers-reduced-motion: reduce)` collapses all motion to 0ms / 120ms fade.

---

## 3. How to Add a Node
1. Edit `data/data_mindmap_taxonomy.json` or update `build_editorial_mindmap.py`.
2. Add your node definition adhering to summary length rules (28–60 words) and key ideas (3–5 bullets, ≤ 12 words per bullet):
```json
{
  "id": "storage-formats-parquet-v3",
  "name": "Parquet V3 Format",
  "domain": "storage",
  "level": 3,
  "difficulty": "A",
  "description": "Columnar storage format specification supporting advanced encodings, modular metadata blocks, and zero-copy reads across cloud analytics clusters. Designed for production workloads requiring high throughput.",
  "whyItMatters": "Slashes storage cost and speeds up query execution.",
  "keyConcepts": [
    "Modular Metadata Blocks",
    "Zero-Copy Buffer Parsing",
    "Optimized Parquet Encodings"
  ],
  "prerequisites": ["storage-formats-parquet"],
  "resources": [
    { "label": "Parquet Specification", "url": "https://parquet.apache.org/" }
  ]
}
```
3. Re-run `python3 build_editorial_mindmap.py`.

---

## 4. How to Add a Domain
1. Add the domain metadata to `DOMAIN_TOKENS` in CSS/JS:
```js
'aiops': { name: 'AI & MLOps', color: 'var(--d11)', key: 'd11' }
```
2. Define domain nodes (`level: 1`) and sub-domains (`level: 2`) in the taxonomy dataset.
3. Re-run `python3 build_editorial_mindmap.py`.

---

## 5. List View & Accessibility Statement
- Pressing `L` or clicking the **List** button in the chrome opens the **Accessible List View Surface** (`#accessible-list-view`).
- Renders an accessible, keyboard-navigable `<ul role="list">` of all 10 domains and 250+ concepts with explicit `aria-label`, `aria-selected`, and `role="region"` attributes.
- Fulfills **WCAG 2.1 AA** compliance with contrast ratios ≥ 4.5:1 on `--bg-base`.

---

## 6. List of Banned Words & Rationale
| Banned Word | Rationale |
|---|---|
| `powerful` | Subjective marketing word; replace with specific technical attributes like `effective` or `high-throughput`. |
| `robust` | Overused buzzword; replace with `resilient` or `fault-tolerant`. |
| `cutting-edge` | Fluff; replace with `modern` or `contemporary`. |
| `next-gen` | Hype term; replace with `modern` or `versioned`. |
| `leverage` | Corporate jargon; replace with `use` or `utilize`. |
| `synergy` | Corporate fluff; replace with `integration` or `interoperability`. |
| `best-in-class` | Unverifiable marketing claim; replace with `standard`. |
| `industry-leading` | Promotional hype; replace with `established` or `widely adopted`. |
| `seamless` | Inaccurate oversimplification; replace with `direct` or `integrated`. |
| `game-changing` | Hyperbole; replace with `significant` or `pivotal`. |
| `in today's world` | Filler text; remove entirely. |
| `in this article` | Meta tutorial noise; remove entirely. |
| `Let's dive in` | Informal conversational filler; remove entirely. |
| `In conclusion` | Conversational filler; remove. |
| `delve into` | Repetitive AI essay trope; replace with `examine` or `analyze`. |
| `scalable solution` | Generic buzzword; replace with `scalable system` or `distributed architecture`. |
| `empower` | Promotional fluff; replace with `enable` or `allow`. |
| `unlock the power` | Cliché marketing phrase; replace with `utilize capabilities`. |
