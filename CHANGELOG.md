# Changelog

## v0.4 — Editorial Rebuild (2026-07-31)

### 🎨 Complete Aesthetic & Structural Redesign
- **Design Philosophy**: Transformed interface from a bright infographic style into a quiet, data-dense, editorial knowledge graph inspired by Linear, Stripe, Vercel, and Apple Newsroom.
- **Five-Zone Layout Architecture**:
  - **Zone A (Global Chrome)**: 56px sticky bar with tracked monospace wordmark `DE.UNIVERSE`, central ⌘K search trigger, segmented difficulty control (`All | B | I | A | X`), version tag `v0.4.2`, and Accessible List View toggle.
  - **Zone B (Index Panel)**: 240px sticky left sidebar listing 10 domains with 3px color line indicators and concept counts.
  - **Zone C (Knowledge Graph)**: SVG full-bleed interactive graph renderer utilizing `d3-force` (settled static layout after 300 ticks, no continuous spinning or breathing animation, straight 1px vector lines).
  - **Zone D (The Inspector)**: 360px sticky right sidebar rendering structured, factual concept cards with 28-60 word summaries, 3-5 key idea bullets, prerequisite chips, external links (`rel="noopener noreferrer"`), and ghost action buttons.
  - **Zone E (Footer / Timeline)**: 32px bottom bar showing breadcrumb history and keyboard shortcut reference hints.

### 🚫 Design Disciplines & Hard Constraints Enforced
- **Zero Emojis**: Replaced all emojis with SVG inline vectors and pure typography.
- **Strict Color Tokens**: Palette bound to `--bg-base (#07080C)`, `--bg-elevated (#0B0D14)`, `--bg-overlay (#11141C)`, `--line (#15171C)`, `--text-primary (#E8EAED)`, `--accent (#7C9CFF)` with 10 domain tokens and 4 difficulty tokens.
- **Micro-Interaction Motion**: All transitions explicitly named (no `transition: all`), capped at 1.2s max duration, and using `cubic-bezier(0.32, 0.72, 0, 1)` easing.
- **Sanitized Taxonomy**: Cleaned all 250+ node descriptions to remove marketing buzzwords (`"robust"`, `"powerful"`, `"next-gen"`, `"seamless"`, etc.).
- **Accessible List View (`L`)**: Keyboard-navigable `<ul>` list view surface providing 100% WCAG AA compliance.
