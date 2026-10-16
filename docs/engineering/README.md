# Engineering & Operations Documentation

> **Developer Quickstart, Architecture Specifications, Test Runbooks & Strategic Roadmap**  
> Operational guidelines for building, testing, optimizing, and deploying [`fabric-pbi-prep.vercel.app`](https://fabric-pbi-prep.vercel.app).

---

## 🛠️ Engineering Directory

| Document | Primary Scope | Operational Focus | Link |
| :--- | :--- | :--- | :--- |
| **Development & Operations Guide** | Project architecture, Server Data Layer, Vitest suite, Vercel | App Router folder layout, Zero-Bundle Data Mandate, 32 Vitest suites (298 tests), deployment lifecycle. | [`development_guide.md`](./development_guide.md) |
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

# Deploy to Vercel production
npx vercel --prod --yes
```

---

[← Back to Central Documentation Hub](../README.md)
