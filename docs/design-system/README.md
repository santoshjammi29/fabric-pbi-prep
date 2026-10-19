# Design System & Editorial Guidelines

> **Visual Language, Design Tokens, Component Primitives & Motion Specifications**  
> Defining the quiet, data-dense, Apple- and Linear-inspired aesthetic of [`lakehousearchitect.vercel.app`](https://lakehousearchitect.vercel.app).

---

## 🎨 Design System Directory

| Specification | Primary Scope | Key Standards & Implementations | Link |
| :--- | :--- | :--- | :--- |
| **Design Tokens & UI Primitives** | Color palette, fluid typography, 4px grid, component API | Surfaces (`base`, `raised`, `overlay`, `sunken`), `clamp()` fluid type scale, Heading/Card/Button/Badge primitives. | [`tokens_and_primitives.md`](./tokens_and_primitives.md) |

---

## 📐 Core Aesthetic Principles

1. **Quiet, Restrained Typography**: High-legibility typography scale using system fonts (`SF Pro Display`, `Inter`, and `JetBrains Mono`) with mathematical fluid clamping.
2. **Semantic Surface Elevation**: Clear hierarchical boundaries (`surface.base` `#0a0a0a` $\rightarrow$ `surface.raised` `#171717` $\rightarrow$ `surface.overlay` `#262626`) with 1px hairline borders (`#262626`).
3. **GPU-Accelerated Motion**: Motion models use hardware-accelerated canvas elements and transform-only CSS transitions with strict cubic-bezier easings (`cubic-bezier(0.22, 1, 0.36, 1)`).
4. **Zero Fluff & Pure Signal**: Strict prohibition on marketing hype words (`seamless`, `cutting-edge`, `robust`, `powerful`), prioritizing concrete architecture parameters, throughputs, and code examples.

---

[← Back to Central Documentation Hub](../README.md)
