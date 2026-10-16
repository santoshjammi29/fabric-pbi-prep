# Central Documentation Hub: `fabric-pbi-prep`

> **Unified Enterprise Knowledge Architecture & Operational Guidelines**  
> Comprehensive documentation library for [`https://fabric-pbi-prep.vercel.app`](https://fabric-pbi-prep.vercel.app).

---

## 🧭 Master Documentation Sitemaps

The documentation is structured into four specialized pillars designed for Data Architects, Staff Engineers, UI Engineers, and Technical Leaders:

```
docs/
├── architecture/      # 8 Deep-Dive Modules + JSON Export + 32 Blueprints
├── audits/            # Production Edge Benchmarks, Theme & Design System Audits
├── design-system/     # Design Token System 2.0, UI Primitives, Editorial Spec
└── engineering/       # Development Quickstart, Vitest Testing Runbook, Roadmap
```

---

## 1. 🏛️ Architecture & System Design (`docs/architecture/`)

In-depth technical guides, failure mode analysis, decision trees, and production walkthroughs:

| Module | Title | Topic Highlights | Link |
| :---: | :--- | :--- | :--- |
| **01** | **Azure Synapse Architecture** | Dedicated SQL Pools (MPP), Serverless SQL, Managed VNet, WLM, skews | [`architecture/01_azure_synapse.md`](./architecture/01_azure_synapse.md) |
| **02** | **Microsoft Fabric Mastery** | OneLake Shortcuts, Lakehouse vs Warehouse, Direct Lake, F-SKU Capacity | [`architecture/02_microsoft_fabric.md`](./architecture/02_microsoft_fabric.md) |
| **03** | **NoSQL & Vector Databases** | Cosmos DB RU/s tuning, multi-region write, pgvector & Qdrant for RAG | [`architecture/03_nosql_vector_db.md`](./architecture/03_nosql_vector_db.md) |
| **04** | **Modern ETL/ELT & Streaming** | Spark vs Flink vs DuckDB/Polars, Delta UniForm vs Iceberg, Airflow | [`architecture/04_etl_stream_proc.md`](./architecture/04_etl_stream_proc.md) |
| **05** | **Lakehouse FinOps** | TCO models, Serverless SQL auto-scaling, Spot instance arbitrage, VACUUM | [`architecture/05_lakehouse_finops.md`](./architecture/05_lakehouse_finops.md) |
| **06** | **Enterprise Blueprints** | 6 End-to-End Enterprise Blueprints with Mermaid sequence flows | [`architecture/06_enterprise_blueprints.md`](./architecture/06_enterprise_blueprints.md) |
| **07** | **Open Storage Formats** | Delta Lake, Apache Iceberg, Apache Hudi, Paimon, Parquet, ORC, Avro | [`architecture/07_open_storage_formats.md`](./architecture/07_open_storage_formats.md) |
| **08** | **6 Delta Lake Optimizations** | Benchmarking 6 Delta Lake optimization levers across 50M rows | [`architecture/08_delta_optimization.md`](./architecture/08_delta_optimization.md) |
| **Data**| **Machine-Readable Export** | Full structured JSON dataset with metadata tags for SSGs & RAG | [`architecture/knowledge_base_export.json`](./architecture/knowledge_base_export.json) |

👉 **[Explore Full Architecture Library](./architecture/README.md)**

---

## 2. 📊 Production Audits & Quality Reports (`docs/audits/`)

Verified edge network benchmarks, accessibility certifications, and Lighthouse audits:

| Document | Primary Focus | Key Score / Metric | Link |
| :--- | :--- | :--- | :--- |
| **Enterprise Production Audit** | Edge TTFB, LCP, Zero-Bundle DAL, Test Coverage | **99/100 Lighthouse**, LCP: 0.8s, **298 Tests Passed** | [`audits/production_audit.md`](./audits/production_audit.md) |
| **Theme & Contrast Audit** | Zero-Flash Theme Switch, Runtime Contrast Matrix | **<16ms Theme Toggle**, WCAG 2.1 AA Certified | [`audits/theme_audit.md`](./audits/theme_audit.md) |
| **Design System Audit** | Fluid Typography Clamp, 6 Responsive Breakpoints | **100% Pass Rate across 32 Test Suites** | [`audits/design_system_audit.md`](./audits/design_system_audit.md) |

👉 **[Explore Full Audits Directory](./audits/README.md)**

---

## 3. 🎨 Design System & Motion Specifications (`docs/design-system/`)

UI components, mathematical fluid typography, and hardware-accelerated canvas motion:

| Document | Primary Focus | Key Specifications | Link |
| :--- | :--- | :--- | :--- |
| **Design Tokens & UI Primitives** | Design Token System 2.0 (`color`, `font`, `space`) | Surface elevation, fluid type scale, Heading/Card/Button API | [`design-system/tokens_and_primitives.md`](./design-system/tokens_and_primitives.md) |

👉 **[Explore Design System Specifications](./design-system/README.md)**

---

## 4. 🛠️ Engineering, Operations & Roadmap (`docs/engineering/`)

Developer onboarding, architecture rules, testing runbooks, and strategic planning:

| Document | Primary Focus | Operational Guide | Link |
| :--- | :--- | :--- | :--- |
| **Development & Operations Guide** | Next.js 16 App Router, DAL, Vitest suite, Vercel | Local setup, Zero-Bundle rule, 32 Vitest suites runbook | [`engineering/development_guide.md`](./engineering/development_guide.md) |
| **Platform Engineering Roadmap** | Completed milestones & v2.0+ planned expansions | Databricks 100, 6 Optimization Levers, Arrow Flight SQL | [`engineering/roadmap.md`](./engineering/roadmap.md) |

👉 **[Explore Engineering Runbooks](./engineering/README.md)**

---

[← Back to Project Root](../README.md)
