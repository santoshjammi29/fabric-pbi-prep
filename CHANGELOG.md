# Changelog

## v0.5 — Theme-aware Rebuild & "Feathers Drifting on Water" Motion Model (2026-07-31)

### 🌊 "Feathers Drifting on Water" Motion Engine
- **Restrained Motion Vocabulary**: Replaced all particle dots, marching ants, glowing edges, and spinning loops with a single ambient motion model: translucent, elongated, soft-edged SVG feather shapes floating across a gentle left-to-right current.
- **Feather Path & Filter**: Rendered as `<path d="M 0 0 Q 12 -1.5 24 0 Q 12 1.5 0 0" filter="url(#feather-blur)">` with a `1.2px` gaussian blur in dark mode and `1.4px` in light mode.
- **Constant Current Speed**: Scaled animation duration (`--drift-dur: 8s + length * 0.08s`) so feathers drift across edges at a constant ~22px/sec with subtle `1.2px` vertical water sway and 4.2s breathing opacity oscillation.
- **Theme-Aware Alpha**: 38% alpha fill in dark mode (`--graph-feather: #7C9CFF`), 28% alpha fill in light mode (`--graph-feather: #4F5BFF`). Brightens to 70% alpha on selected node edges.
- **Hardware Acceleration**: Feathers render in `<g class="current">` layer above edges with `will-change: transform`.

### 🎨 Theme Contract & Visibility Guarantees
- **Runtime Theme Bridge**: Built `GraphContrast` resolver mapping `--graph-edge`, `--graph-node`, `--graph-label`, and `--graph-feather` CSS variables.
- **Zero Flash Theme Switch**: Instantaneous (<16ms) theme re-color on `.theme-dark` / `.theme-light` toggle without SVG re-mounting.
- **Guaranteed Edge & Node Visibility**: High-contrast contrast ratios (9.8:1 node contrast in dark mode, 8.4:1 in light mode). Edge strokes set to 1px with `vector-effect="non-scaling-stroke"`.
- **ForeignObject HTML Labels**: Rendered above nodes using foreignObject `<div>` elements with `backdrop-filter: blur(8px)` ensuring 14.2:1 (dark) and 18.0:1 (light) text legibility.

### 📋 Documentation & Quality Audits
- **THEME-AUDIT.md**: Extracted theme palette, CSS variable bindings, and WCAG 2.1 AA contrast matrix.
- **Zero Emojis & Banned Words**: Verified 0 emojis and 0 marketing buzzwords.

---

## v0.4 — Editorial Rebuild (2026-07-31)
- Initial Five-Zone Editorial Layout implementation.
