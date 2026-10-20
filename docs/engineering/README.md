# Engineering & Operations Documentation

> **Developer Quickstart, Architecture Specifications, Test Runbooks & Strategic Roadmap**  
> Operational guidelines for building, testing, optimizing, and deploying the Cloudflare Workers application.

---

## 🛠️ Engineering Directory

| Document | Primary Scope | Operational Focus | Link |
| :--- | :--- | :--- | :--- |
| **Development & Operations Guide** | Project architecture, Server Data Layer, Vitest suite, Cloudflare Workers | App Router folder layout, Zero-Bundle Data Mandate, test suites, deployment lifecycle. | [`development_guide.md`](./development_guide.md) |
| **Platform Engineering Roadmap** | Completed milestones & future architectural expansions | Databricks 100, 6 Delta Lake optimization levers, high-throughput in-process compute (Arrow Flight, DuckDB). | [`roadmap.md`](./roadmap.md) |

---

## ⚡ Fast Developer Cheat Sheet

```bash
# Start local development server
npm run dev

# Run full Vitest automated test suite (32 test files, 298 tests)
npm test -- --run

# Run Next.js production build (verify zero TS or bundle errors)
npm run build

# Deploy generated R2 artifacts and the OpenNext Worker to Cloudflare
npm run deploy:cf
```

---

[← Back to Central Documentation Hub](../README.md)
