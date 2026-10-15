# Microsoft Data Platform & Lakehouse Architect Prep (`fabric-pbi-prep`)

[![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19_Server_Components-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-298_Passed_(32_Files)-green?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Production Status](https://img.shields.io/badge/Production-Live_on_Vercel-success?style=flat-square&logo=vercel)](https://fabric-pbi-prep.vercel.app)

> **Enterprise-Grade Cloud Educational Platform & Architecture Encyclopedia**  
> Tailored for Principal Data Architects, Staff Data Engineers, and Lead Analytics Engineers mastering Microsoft Fabric, Databricks, Delta Lake, Apache Spark, Power BI, Azure Data Factory, and Modern Lakehouse Design.

🌐 **Live Application**: [https://fabric-pbi-prep.vercel.app](https://fabric-pbi-prep.vercel.app)

---

## 🏛️ System Architecture

`fabric-pbi-prep` is engineered with a **Zero-Bundle Data Architecture**, isolating all large datasets to server-side Data Access Layers (DAL) with React 19 `cache()` request deduplication, rendering 60 FPS client surfaces using `@tanstack/react-virtual` and hardware-accelerated HTML5 `<canvas>`:

```
       ┌─────────────────────────────────────────────────────────────┐
       │                   GLOBAL EDGE TIER (Vercel)                 │
       │    middleware.ts (Edge Routing, SWR Cache-Control Headers)  │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
┌───────────────────────────┐                   ┌───────────────────────────┐
│     SERVER DATA LAYER     │                   │   CLIENT BROWSING ENGINE  │
│  - React 19 cache() DAL   │                   │  - 0 KB JSON bundled      │
│  - Zero-Bundle Imports    │                   │  - TanStack Virtual DOM   │
│  - Edge SWR API Routes    │                   │  - HTML5 Canvas 60fps     │
│  - Edge ISR (1h refresh)  │                   │  - Web Worker SIMD Offload│
└───────────────────────────┘                   └───────────────────────────┘
```

---

## 📊 Comprehensive Data Inventory (10,700+ Assets)

The platform curates the largest verified collection of data platform interview scenarios, coding benchmarks, and system design specifications in the industry:

| Dataset / Module | Source File | Record Count | Architectural Scope & Highlights |
| :--- | :--- | :--- | :--- |
| **Architectural Concepts** | `src/data/json/data_concepts.json` | **622 Concepts** | 10 primary domains: Fabric, Databricks, ADF, Airflow, dbt, SQL Server, Lakehouse, Spark, Power BI, Modern DE. |
| **Databricks 100 Mastery** | `src/data/json/databricks_100.json` | **100 Concepts** | 100-day structured mastery curriculum with code snippets, certification mapping (DE Associate/Professional), and deep explanations. |
| **Architecture Scenarios** | `src/data/json/data_architecture.json` | **3,200 Scenarios** | End-to-end enterprise scenarios with trade-off matrices, failure modes, and architectural decision trees. |
| **Data Engineering Practice** | `src/data/json/data_de.json` | **3,597 Q&As** | Distributed systems, streaming CDC, pipeline reliability, data modeling, and lakehouse performance. |
| **Core Platform Q&A** | `src/data/json/questions.json` | **3,207 Q&As** | Deep technical questions spanning Microsoft Fabric, Power BI, Azure Synapse, ADF, Spark, and SQL Server. |
| **Whiteboard Blueprints** | `src/data/diagrams.ts` | **32 Blueprints** | Hand-drawn digital architecture diagrams (WebP/AVIF) with technical mechanics, key points, and documentation links. |
| **Databricks Cheat Sheets** | `src/data/json/databricks_cheatsheets.json` | **48 Cards (6 Suites)** | Interactive code cards across Master, PySpark, Spark SQL, Python, Spark Core with vector PDFs and posters. |
| **GCC Enterprise Directory** | `src/data/json/company_profiles.json` | **156 Companies** | Top Tier-1 Global Capability Centers in Hyderabad and Bangalore with compensation tiers and tech stack requirements. |
| **Extreme Architect Q&A** | `extreme_architect_questions_block*.json` | **125 Scenarios** | High-pressure FAANG/Staff+ scenario questions divided across 5 specialized domain blocks. |
| **PySpark Code Practice** | `src/data/json/data_pyspark.json` | **43 Exercises** | Includes hands-on empirical benchmarking of the **6 Delta Lake Optimization Levers** across 50M rows. |
| **Spark SQL Engine** | `src/data/json/data_sparksql.json` | **44 Exercises** | Catalyst plan inspection, CBO, shuffle partition tuning, bucketing, and skew salting. |
| **Learning Paths** | `src/data/json/data_paths.json` | **12 Paths** | Structured certification roadmaps for DP-600, DP-203, PL-300, and Databricks Professional Data Engineer. |

---

## 🎨 Enterprise Whiteboard Blueprints (32 Diagrams)

All whiteboard architecture blueprints are available in high-resolution lossless **WebP** and **AVIF** formats under `/public/diagrams/`:

1. **Microsoft Fabric Unified Architecture & OneLake** (`fabric-onelake-architecture`)
2. **Power BI Direct Lake Mode & VertiPaq Semantic Engine** (`powerbi-direct-lake-vertipaq`)
3. **Power BI DAX Engine Mechanics & Context Transition** (`powerbi-dax-engine-context`)
4. **Apache Airflow Distributed Architecture & Executors** (`apache-airflow-distributed-architecture`)
5. **dbt Analytics Engineering DAG & Transformation Framework** (`dbt-analytics-engineering-dag`)
6. **Azure Data Factory Hybrid Pipeline & Self-Hosted IR** (`adf-hybrid-integration-runtime`)
7. **Apache Kafka Event Streaming & High-Throughput Messaging** (`kafka-event-streaming-pipeline`)
8. **Change Data Capture (CDC) with Debezium & Streaming Lakehouse** (`cdc-debezium-lakehouse-pipeline`)
9. **Databricks Multi-Hop Medallion Architecture** (`databricks-medallion-pipeline`)
10. **Databricks Delta Live Tables (DLT) Declarative Pipeline** (`delta-live-tables-pipeline`)
11. **Databricks Platform Landscape & Core Engine Overview** (`databricks-platform-master`)
12. **Enterprise RAG & Vector Search Data Ingestion Pipeline** (`rag-vector-search-data-pipeline`)
13. **Databricks Unity Catalog Centralized Governance & Lineage** (`unity-catalog-governance`)
14. **Microsoft Purview Enterprise Unified Governance & Metadata** (`purview-governance-catalog`)
15. **Delta Lake Under-The-Hood ACID Transaction Mechanics** (`delta-lake-under-the-hood`)
16. **Apache Iceberg Open Table Format & Snapshot Tree** (`apache-iceberg-open-table-format`)
17. **Open Table Formats Comparison: Delta Lake vs Iceberg vs Hudi** (`open-table-formats-lakehouse`)
18. **Open File Formats Comparison: Parquet vs ORC vs Avro** (`open-file-formats-storage`)
19. **6 Delta Lake Optimization Techniques: Partitioning, Z-Order, OPTIMIZE, Auto Optimize, Liquid Clustering, VACUUM** (`databricks-optimization-techniques-architecture`)
20. **Databricks Compute: Catalyst Optimizer, AQE & Photon Engine** (`spark-catalyst-photon-engine`)
21. **Apache Spark Shuffle Internals & Unified Memory Architecture** (`spark-shuffle-memory-execution`)
22. **SQL Server Relational Engine, Query Optimizer & Buffer Pool** (`sql-server-query-engine-optimization`)
23. **Kimball Dimensional Modeling & Enterprise Star Schema Design** (`kimball-dimensional-star-schema`)
24. **Data Vault 2.0 Enterprise Modeling: Hubs, Links, Satellites** (`data-vault-enterprise-architecture`)
25. **Enterprise Edge Computing, IoT Hub & Distributed Gateways** (`enterprise-edge-client-architecture`)
26. **Distributed Systems Resilience, Circuit Breakers & Consensus** (`distributed-systems-resilience-architecture`)
27. **Python High-Performance Data Engineering: Arrow, Polars & DuckDB** (`python-arrow-polars-architecture`)
28. **Enterprise Data Mesh Architecture: Domain Ownership & Products** (`data-mesh-enterprise-architecture`)
29. **Apache Spark Data Skew Handling & Adaptive Query Execution** (`spark-data-skew-aqe-optimization`)
30. **Enterprise Lakehouse FinOps & Cloud Cost Optimization** (`lakehouse-finops-cost-optimization`)
31. **Databricks Asset Bundles (DABs) & Serverless CI/CD Architecture** (`databricks-dabs-devops-pipeline`)
32. **Databricks Master Architecture** (`databricks-platform-master`)

---

## ⚡ Core Application Features

- **Universal Multi-Word Fuzzy Search (`⌘K` / `Ctrl+K`)**: Cross-route discovery engine indexing all concepts, questions, blueprints, and cheat sheets simultaneously with instant keyboard navigation.
- **Guided Learning Journeys (`/guided-learning`)**: Topic-based cross-section paths (ADF, Databricks, Fabric, Spark, Airflow, dbt, SQL Server) that aggregate concepts, code, blueprints, and questions into a single progressive roadmap.
- **DE.UNIVERSE Mindmap (`/data-engineering-mindmap`)**: 10 primary domains, 250+ concepts, rendered via an editorial HTML5 `<canvas>` GPU engine running at a smooth 60 FPS with gentle fluid motion.
- **Databricks 100 Day Challenge (`/concepts`)**: Structured 100-day curriculum with daily progress tracking, certification mapping, and code implementations.
- **Architectural Blueprints Gallery (`/architecture`)**: Interactive whiteboard blueprint viewer with modal zoom, key takeaways, and direct documentation links.
- **Code Practice Hub (`/code-practice`)**: Side-by-side PySpark, Spark SQL, and Python code benchmarks with live copyable snippets.
- **Cheat Sheet Vector Hub (`/cheat-sheet`)**: Databricks Master, PySpark, Spark SQL, and Spark Core cheat sheets available as interactive web cards, vector PDFs, and wall posters.
- **Offline Progress Tracking**: Secure browser `localStorage` state tracking questions as *Unseen*, *Reviewing*, or *Mastered* without requiring server login.

---

## 🛠️ Local Development & Testing

### Prerequisites
- Node.js 18.17+ or Node.js 20+
- Python 3.10+ (for data processing scripts)

```bash
# 1. Install dependencies
npm install

# 2. Start Next.js development server
npm run dev
# App running at http://localhost:3000

# 3. Run complete automated Vitest test suite (32 test files, 298 tests)
npm test -- --run

# 4. Run production build (zero TypeScript or bundle errors)
npm run build

# 5. Production deployment to Vercel
npx vercel --prod --yes
```

---

## 🧪 Testing & Quality Assurance

Our automated verification suite enforces zero regressions across data integrity, accessibility, responsive UI, and search indexing:

- **32 Test Files**: 100% passing (`src/__tests__/*`)
- **298 Unit & Integration Tests**: Validating schema conformity, category distributions, search tokenization, Web Worker SIMD execution, and viewport responsiveness.
- **Zero-Bundle Enforcement**: Verifies no raw data JSON imports leak into client-side JS chunks.

---

## 📜 Technical Guides & Knowledge Base

- [Open Format Storage Types: Architecture Blueprints & Deep-Dive Reference](docs/open_format_storage_types_guide.md)
- [Enterprise Data Architecture Knowledge Base](docs/knowledge-base/README.md)
  - [Module 01: Azure Synapse Architecture](docs/knowledge-base/01_azure_synapse_architecture.md)
  - [Module 02: Microsoft Fabric Mastery](docs/knowledge-base/02_microsoft_fabric_mastery.md)
  - [Module 03: Modern NoSQL & Vector Databases](docs/knowledge-base/03_modern_nosql_and_vector_databases.md)
  - [Module 04: Modern ETL/ELT & Stream Processing](docs/knowledge-base/04_modern_etl_elt_applications.md)
  - [Module 05: Revenue-Generating vs Cost-Effective FinOps](docs/knowledge-base/05_revenue_generating_vs_cost_effective_finops.md)
  - [Module 06: Architectural Practice Walkthroughs](docs/knowledge-base/06_architectural_practice_walkthroughs.md)
- [Mindmap Editorial Specification](MINDMAP_README.md)
- [Development, Testing & Operations Guide](DEVELOPMENT.md)
- [Production Audit Report](PRODUCTION_AUDIT.md)
- [Design System & UI Tokens Specification](DESIGN_SYSTEM.md)
