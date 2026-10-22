# Lakehouse Architect (`fabric-pbi-prep`)

[![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19_Server_Components-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-41_Files_•_355_Passed-green?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Edge Architecture](https://img.shields.io/badge/Deployment-Cloudflare_OpenNext-F38020?style=flat-square&logo=cloudflare)](https://developers.cloudflare.com/workers/)

> **Enterprise-Grade Cloud Educational Platform & Lakehouse Architecture Encyclopedia**  
> Tailored for Principal Data Architects, Staff Data Engineers, and Lead Analytics Engineers mastering Microsoft Fabric, Databricks, Apache Spark, Delta Lake, Apache Iceberg, Power BI, Azure Data Factory, and Modern Lakehouse Design.

---

## 🏛️ System Architecture

Built on a **Zero-Bundle, Zero-Egress Architecture**: massive data catalogs stay strictly server-side within React 19 `cache()` Data Access Layers (DAL), serving zero-bundle lightweight JSON payloads to 60 FPS virtualized client surfaces (`@tanstack/react-virtual` + HTML5 `<canvas>`). Large dataset shards are persistently cached in the browser's IndexedDB (`idb`), guaranteeing **0 bytes of repeat network egress** across tab switches and page reloads:

```
       ┌─────────────────────────────────────────────────────────────┐
       │             GLOBAL EDGE TIER (Cloudflare OpenNext)          │
       │       proxy.ts (Edge Routing, SWR Invalidation, R2 Cache)   │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
┌───────────────────────────┐                   ┌───────────────────────────┐
│     SERVER DATA LAYER     │                   │   CLIENT BROWSING ENGINE  │
│  - React 19 cache() DAL   │                   │  - 0 KB Raw JSON Bundled  │
│  - Sharded R2 Artifacts   │                   │  - Persistent IndexedDB   │
│  - Edge SWR API Routes    │                   │  - TanStack Virtual DOM   │
│  - Dynamic MinSearch Index│                   │  - Zero-Egress Tab Switch │
│  - Idempotent R2 Syncing  │                   │  - Local Progress Sync    │
└───────────────────────────┘                   └───────────────────────────┘
```

---

## 📊 Curated Data Inventory (11,400+ Assets)

The platform hosts the industry's most rigorous, verified repository of data engineering scenarios, system design benchmarks, and architecture blueprints:

| Category | Module / Dataset | Count | Focus & Architectural Scope |
| :--- | :--- | :---: | :--- |
| **System Design** | Architecture Scenarios | **3,206** | End-to-end cloud designs, trade-off matrices, failure modes & decision trees. |
| **Technical Q&A** | Data Engineering Practice | **3,615** | Distributed compute, streaming CDC, pipeline reliability & lakehouse design. |
| **Technical Q&A** | Core Platform Questions | **3,232** | Deep internals across Fabric, Power BI, Synapse, ADF, Spark & SQL Server. |
| **Staff+ Mastery** | Extreme Architect Scenarios | **125** | High-pressure Staff/Principal interview design problems across 5 domain blocks. |
| **Core Concepts** | Architectural Concepts | **660** | 10 domains: Fabric, Databricks, Lakehouse, Spark, Power BI, ADF, Airflow, dbt. |
| **Curriculum** | Databricks 100 Mastery | **100** | 100-day structured roadmap with certification mappings (DE Associate & Pro). |
| **Visual Design** | Whiteboard Blueprints | **42** | High-resolution lossless WebP/AVIF digital blueprints with detailed mechanics. |
| **Enterprise Guide**| GCC Enterprise Directory | **156** | Tier-1 Global Capability Centers (Bangalore/Hyderabad) with tech stack requirements. |
| **Coding Practice** | Engine Benchmark Exercises | **172** | Hands-on PySpark (43), Spark SQL (44), MSSQL (35), and Python/DataOps (42). |
| **Reference** | Cheatsheet Card Suites | **117** | 48 Databricks suite cards + 69 quick reference cards (Web, PDF, Poster). |
| **Roadmaps** | Learning Paths | **12** | Structured certification paths for DP-600, DP-203, PL-300, and Databricks. |

---

## 🎨 Enterprise Whiteboard Blueprints (42 Blueprints)

All blueprints are rendered as high-fidelity hand-drawn digital schematics (available in `/public/diagrams/` in WebP & AVIF formats) and grouped into 7 core architectural domains:

| Architectural Domain | Count | Highlighted Production Blueprints |
| :--- | :---: | :--- |
| **Compute & Optimization** | **11** | Catalyst Optimizer & Photon Engine • Shuffle & Memory Architecture • Data Skew & AQE • SaveMode Handling • Join Strategy Decision Matrix • Tungsten Spill Mechanics • Structured Streaming State Store (RocksDB) • Photon vs. JVM • Broadcast & Accumulators • SQL Server Engine Internals |
| **Storage Engines & Formats** | **8** | Delta Lake ACID Under the Hood • Apache Iceberg Snapshot Tree • Open Table Formats (Delta vs. Iceberg vs. Hudi) • Open File Formats (Parquet vs. ORC vs. Avro) • 6 Delta Optimization Levers • Delta vs. Iceberg Internals • Lakehouse ACID Concurrency Matrix • SCD Types 0–6 in Medallion |
| **Pipelines & Ingestion** | **8** | Apache Airflow Distributed Architecture • dbt Modern Analytics Engineering DAG • Azure Data Factory Hybrid IR • Kafka Event Streaming • CDC with Debezium • Databricks Medallion Architecture • Delta Live Tables (DLT) • Databricks Asset Bundles (DABs) & Serverless CI/CD |
| **Platform Landscape** | **5** | Databricks Unified Platform Master • Enterprise RAG & Vector Data Pipelines • Modern Python Data (Arrow, Polars, DuckDB) • FinOps & Cloud Cost Optimization • Enterprise Edge & IoT Architecture |
| **Microsoft Fabric & Power BI**| **4** | Microsoft Fabric Unified Architecture & OneLake • Power BI Direct Lake & VertiPaq • Power BI DAX Engine Mechanics & Context Transition • Fabric OneLake Shortcuts & Direct Lake Mode |
| **Data Modeling & Architecture**| **4** | Kimball Dimensional Modeling & Star Schema • Data Vault 2.0 Enterprise Modeling • Distributed Systems Resilience & Consensus • Enterprise Data Mesh & Data Products |
| **Governance & Security** | **2** | Unity Catalog Unified Governance & 3-Level Namespace • Microsoft Purview Unified Metadata & Catalog |

---

## ⚡ Core Platform Capabilities

- **Universal Fuzzy Search (`⌘K` / `Ctrl+K`)**: Sub-millisecond client-side discovery engine indexing all 11,400+ assets with instant keyboard navigation.
- **Guided Learning Roadmaps (`/guided-learning`)**: Unified multi-domain progression trees combining concepts, code benchmarks, blueprints, and interview scenarios.
- **Databricks 100-Day Challenge (`/concepts`)**: Progressive daily curriculum covering Apache Spark internals, Delta Lake mechanics, and certification readiness.
- **Interactive Architecture Gallery (`/architecture`)**: Full-screen modal inspector with technical takeaways, deep-dive mechanics, and documentation references.
- **Hands-on Engine Practice (`/code-practice`)**: Side-by-side PySpark, Spark SQL, and Python code benchmarks with live copyable snippets.
- **Databricks Cheatsheet Hub (`/cheat-sheet`)**: Interactive card decks, downloadable vector PDFs, and high-resolution wall posters.
- **Zero-Login Local Progress Sync**: Encrypted client-side `localStorage` tracking (*Unseen*, *Reviewing*, *Mastered*) with exportable progress reports.

---

## 🛠️ Quick Start & Developer Guide

### Prerequisites
- Node.js 18.17+ or 20+
- Python 3.10+ (for content sharding & validation scripts)

```bash
# 1. Install project dependencies
npm install

# 2. Run local Next.js development server
npm run dev
# Open http://localhost:3000

# 3. Execute automated test suite (41 test files, 355 tests)
npm test

# 4. Production build & Cloudflare Workers bundle
npm run build:cf

# 5. Full production deployment to Cloudflare with idempotent R2 sync
npm run deploy:cf

# 6. Fast-track code-only deployment (~35 seconds, skips R2 uploads)
npm run deploy:quick
```

---

## 🧪 Testing & Verification

Automated quality gates validate data schemas, bundle hygiene, accessibility, and search indexing:

- **41 Test Files**: 100% passing across unit, integration, and UI component tests.
- **355 Tests**: Comprehensive coverage spanning search tokenization, virtual scroll limits, SIMD worker offloads, and responsive layout constraints.
- **Zero-Bundle Enforcement**: Automated tests verify that no raw JSON data leaks into client JavaScript bundles.

---

## 📜 Documentation Directory

Detailed platform architecture guides and engineering runbooks are maintained in [`docs/`](docs/README.md):

| Documentation Pillar | Scope & Focus Areas | Direct Links |
| :--- | :--- | :--- |
| **[Architecture & Blueprints](docs/architecture/README.md)** | Lakehouse systems, storage internals, and engine blueprints | [`01_azure_synapse.md`](docs/architecture/01_azure_synapse.md) • [`02_microsoft_fabric.md`](docs/architecture/02_microsoft_fabric.md) • [`05_lakehouse_finops.md`](docs/architecture/05_lakehouse_finops.md) • [`06_enterprise_blueprints.md`](docs/architecture/06_enterprise_blueprints.md) • [`07_open_storage_formats.md`](docs/architecture/07_open_storage_formats.md) • [`08_delta_optimization.md`](docs/architecture/08_delta_optimization.md) |
| **[Production Audits](docs/audits/README.md)** | Performance benchmarks, theme contrast & accessibility | [`production_audit.md`](docs/audits/production_audit.md) • [`theme_audit.md`](docs/audits/theme_audit.md) • [`design_system_audit.md`](docs/audits/design_system_audit.md) |
| **[Design System](docs/design-system/README.md)** | Fluid tokens, typography scale & motion specifications | [`tokens_and_primitives.md`](docs/design-system/tokens_and_primitives.md) |
| **[Engineering & Operations](docs/engineering/README.md)** | App Router DAL, deployment guide & platform roadmap | [`development_guide.md`](docs/engineering/development_guide.md) • [`workers-for-platforms.md`](docs/engineering/workers-for-platforms.md) • [`roadmap.md`](docs/engineering/roadmap.md) |

👉 **[Browse Full Documentation Hub (`docs/README.md`)](docs/README.md)**
