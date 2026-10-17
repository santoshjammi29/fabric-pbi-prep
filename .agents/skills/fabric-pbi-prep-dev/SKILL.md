---
name: fabric-pbi-prep-dev
description: |
  Project-specific development workflow for the fabric-pbi-prep Next.js data platform prep app.
  Activate when working on:
  - The Next.js app at /Users/santosh/antigravity (and /Users/santosh/Documents/antigravity/adventurous-raman/)
  - Adding/modifying data in src/data/json/ (concepts, questions, architecture scenarios, company profiles, Databricks 100)
  - Building new pages under src/app/ (mindmap, guided learning, company research, architecture hub, qa prep, etc.)
  - Running tests, builds, commits, and Git operations for this project
  - Guided learning, Q&A prep, architecture hub, mind map, or concepts page features

  DO NOT trigger for:
  - Other Next.js projects
  - General data engineering questions unrelated to this app
---

# fabric-pbi-prep Dev Skill

You are working on **fabric-pbi-prep** — an enterprise-grade Next.js 16 App Router data engineering and cloud architect interview prep platform deployed at `https://fabric-pbi-prep.vercel.app`.

---

## 1. Project Layout & Route Architecture

```
/Users/santosh/antigravity/ (synced to /Users/santosh/Documents/antigravity/adventurous-raman/)
├── src/
│   ├── app/                               # Next.js 16 App Router routes
│   │   ├── page.tsx                       # Home / Hero Command Center, rolling ticker, recent deployments
│   │   ├── guided-learning/               # 4-tier progressive cross-section learning journey
│   │   ├── concepts/                      # 660 architectural concepts (data_concepts.json)
│   │   ├── mindmap/                       # Multi-level concept stretching mind map (tree & pillar modes)
│   │   ├── qa-prep/                       # 6,847 Q&A scenarios (questions.json + data_de.json)
│   │   ├── architecture/                  # 3,206 architecture scenarios + 32 whiteboard blueprints gallery
│   │   ├── code-practice/                 # 164 practical code cards (PySpark, Spark SQL, Python, MSSQL)
│   │   ├── learning-paths/                # 12 structured career paths (Fabric, Databricks, Azure)
│   │   ├── company-research/              # 156 GCC company profiles (BigTech, FinTech, GCCs)
│   │   ├── modern-stack/                  # Modern stack Q&As, badges, cost playbooks, code matrix
│   │   ├── spark-engine/                  # Spark engine internals, memory model, and AQE
│   │   ├── dataops/                       # DataOps, DABs, and CI/CD automation
│   │   ├── cheat-sheet/                   # Databricks Architecture & Coding Cheat Sheet Suite
│   │   ├── studio/                        # Studio sandbox
│   │   └── api/                           # Serverless Edge API routes (search, questions, concepts, bookmarks, progress)
│   ├── components/
│   │   ├── ui/
│   │   │   └── unified-search-filter-box.tsx # 4-level accessible filter deck & keyboard navigation
│   │   ├── concepts/
│   │   │   └── concepts-mindmap-view.tsx    # 4-depth dynamic stretching mind map engine
│   │   ├── architecture/
│   │   │   └── diagrams-gallery.tsx         # 32 whiteboard blueprint modal viewer & zoom
│   │   ├── layout/                          # Header, breadcrumbs, HubSubnav, mobile drawer
│   │   └── dashboard/                       # Hero command center, rolling ticker, capsules
│   ├── data/
│   │   ├── json/                          # 27 production JSON datasets (10,700+ assets)
│   │   ├── index.ts                       # All dataset exports + getStandardizedDomain()
│   │   ├── diagrams.ts                    # 32 Whiteboard Architecture Blueprint items & metadata
│   │   ├── concepts-tree-data.ts          # 13 core topics & 44 subtopic pillars for mindmap
│   │   ├── guided-learning-topics.ts      # Topic mapping for /guided-learning
│   │   └── navigation-data.ts             # Global navigation links, icons, and shortcuts
│   ├── lib/
│   │   ├── search-engine.ts               # Universal multi-word tokenized search (<5ms)
│   │   ├── qa-filters.ts                  # Dynamic ecosystem & difficulty filter utilities
│   │   ├── guided-learning.ts             # Topic-based cross-dataset aggregation
│   │   └── diagram-theme.ts               # Whiteboard blueprint styling & asset links
│   ├── types/data.ts                      # TypeScript interfaces & types
│   └── __tests__/                         # Vitest test suite (37 test files, 326 unit tests)
├── public/
│   ├── diagrams/                          # 32 Whiteboard Architecture Blueprints (.webp, .avif, .jpg)
│   └── cheatsheets/                       # Vector PDFs & printable high-res cheatsheet posters
└── docs/                                  # Architectural deep-dives, cheat sheets, and blueprints
```

---

## 2. Complete Data File Inventory (All 27 JSON Files)

| File | Export | Type | Count | Highlights |
|------|--------|------|-------|------------|
| `data_concepts.json` | `conceptsDb` | `Concept[]` | **660** | Multi-paragraph deep dives, official definitions, key takeaways. |
| `questions.json` | `questionsDb` | `Question[]` | **3,232** | Core cloud platform and Fabric architect scenarios. |
| `data_de.json` | `questionsDeDb` | `Question[]` | **3,615** | General data engineering, real-world production drills. |
| `data_architecture.json` | `architectureData` | `ArchitectureQuestion[]` | **3,206** | End-to-end system design and production troubleshooting. |
| `company_profiles.json` | `companyProfiles` | `CompanyProfile[]` | **156** | Tier-1 GCC hiring criteria, tech stacks, and rounds. |
| `databricks_100.json` | `databricks100Db` | `DatabricksConcept[]` | **100** | 100-day progressive Databricks mastery challenge with code. |
| `databricks_cheatsheets.json` | `databricksCheatsheets` | `CheatSheetSuite[]` | **6** | 48 curated coding cards across 6 suites with PDF/poster assets. |
| `data_pyspark.json` | `pysparkData` | `CodeSheetItem[]` | **43** | Windowing, AQE, broadcast joins, Delta optimizations. |
| `data_sparksql.json` | `sparksqlData` | `CodeSheetItem[]` | **44** | Catalyst plans, shuffle partitioning, CBO tuning. |
| `data_python.json` | `pythonData` | `CodeSheetItem[]` | **42** | Asyncio, generators, memory management, GIL. |
| `data_mssql.json` | `mssqlData` | `CodeSheetItem[]` | **35** | Query store, index fragmentation, execution plans. |
| `data_paths.json` | `learningPathsDb` | `LearningPath[]` | **12** | Structured career learning journeys. |
| `data_cheatsheet.json` | `cheatsheetData` | `CheatSheetCard[]` | **69** | High-density cheatsheet reference cards. |
| `data_personalised.json` | `personalisedData` | `PersonalisedQuestion[]` | **50** | Targeted scenario-based interview drills. |
| `questions_unified_cleaned.json` | `questionsUnified` | `Question[]` | **2,906** | Cleaned and deduplicated core interview question bank. |
| `modern_blueprints.json` | `modernBlueprints` | `BlueprintItem[]` | **18** | Modern lakehouse architecture blueprints. |
| `modern_badges.json` | `modernBadges` | `BadgeItem[]` | **10** | Certification and skill mastery badges. |
| `modern_concepts.json` | `modernConcepts` | `ModernConcept[]` | **20** | Cutting-edge cloud data platform concepts. |
| `modern_stack.json` | `modernStack` | `StackItem[]` | **20** | Modern data stack component overviews. |
| `modern_subdomains.json` | `modernSubdomains` | `SubdomainItem[]` | **14** | Subdomain taxonomy mappings. |
| `modern_cost_playbooks.json` | `costPlaybooks` | `CostPlaybook[]` | **12** | Cloud Lakehouse FinOps & compute cost reduction playbooks. |
| `modern_code_matrix.json` | `codeMatrix` | `CodeMatrixItem[]` | **9** | Comparative code execution matrix across engines. |
| `extreme_architect_questions_block1..5.json` | `extremeArchBlock1..5` | `ArchitectureQuestion[]` | **125** | 5 blocks of 25 extreme edge-case architect scenarios. |

### Key TypeScript Shapes
```typescript
interface Concept {
  id: string;
  term: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ARCHITECT';
  definition: string;
  explanation: string;
  keyPoints: string[];
}

interface Question {
  id: string;
  source: string;
  category: string;
  niche: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ARCHITECT';
  question: string;
  answer: string;
  domain?: string;
  subdomain?: string;
}

interface ArchitectureQuestion {
  id: string;
  source: string;
  category: string;
  niche: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ARCHITECT';
  question: string;
  answer: string;
}

interface CompanyProfile {
  id: string;
  company: string;
  tier: 'TIER_1_GCC' | 'BIG_TECH' | 'FINTECH';
  category: string;
  location: string;
  techStack: string[];
  hiringBar: string;
  interviewRounds: string[];
  keyQuestions: string[];
}

interface DatabricksConcept {
  id: string;
  day: number;
  term: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  whatYouShouldKnow: string[];
  productionCodeSnippet: string;
  certificationMapping: string[];
}
```

---

## 3. 32 Enterprise Whiteboard Blueprints Catalog

All blueprints follow the hand-drawn digital whiteboard sketch style with 100% white background, semantic colors (Red compute, Blue engine/dispatcher, Yellow raw source, Purple governance, Green Delta/Iceberg target), and are persisted in `public/diagrams/`:

| Blueprint ID | Title | Category | Formats Available |
| :--- | :--- | :--- | :--- |
| `fabric_onelake_architecture` | Microsoft Fabric Unified Architecture & OneLake | Fabric & Power BI | `.webp`, `.avif`, `.jpg` |
| `powerbi_direct_lake_vertipaq` | Power BI Direct Lake Mode & VertiPaq Semantic Engine | Fabric & Power BI | `.webp`, `.avif`, `.jpg` |
| `powerbi_dax_engine_context` | Power BI DAX Formula/Storage Engine Mechanics | Fabric & Power BI | `.webp`, `.avif`, `.jpg` |
| `apache_airflow_architecture` | Apache Airflow Distributed Architecture & Schedulers | Data Pipelines & Ingestion | `.webp`, `.avif`, `.jpg` |
| `dbt_analytics_engineering_dag` | dbt Analytics Engineering DAG & Transformation Mesh | Data Pipelines & Ingestion | `.webp`, `.avif`, `.jpg` |
| `adf_hybrid_architecture` | Azure Data Factory Hybrid Pipeline & SHIR | Data Pipelines & Ingestion | `.webp`, `.avif`, `.jpg` |
| `kafka_event_streaming_pipeline` | Apache Kafka Event Streaming & High-Throughput Messaging | Data Pipelines & Ingestion | `.webp`, `.avif`, `.jpg` |
| `cdc_debezium_lakehouse_pipeline` | CDC with Debezium & Streaming Lakehouse Ingestion | Data Pipelines & Ingestion | `.webp`, `.avif`, `.jpg` |
| `databricks_medallion_architecture` | Databricks Multi-Hop Medallion Architecture | Platform Landscape | `.webp`, `.avif`, `.jpg` |
| `databricks_dlt_pipeline` | Databricks Delta Live Tables (DLT) Declarative ETL | Data Pipelines & Ingestion | `.webp`, `.avif`, `.jpg` |
| `databricks_ecosystem_landscape` | Databricks Platform Landscape & Core Engine Overview | Platform Landscape | `.webp`, `.avif`, `.jpg` |
| `rag_vector_search_data_pipeline` | Enterprise RAG & Vector Search Data Ingestion Pipeline | Data Pipelines & Ingestion | `.webp`, `.avif`, `.jpg` |
| `unity_catalog_architecture` | Databricks Unity Catalog Centralized Governance & Lineage | Governance & Security | `.webp`, `.avif`, `.jpg` |
| `purview_governance_catalog` | Microsoft Purview Enterprise Unified Governance & Metadata | Governance & Security | `.webp`, `.avif`, `.jpg` |
| `delta_lake_mechanism` | Delta Lake Under-The-Hood ACID Transaction Mechanics | Storage Engine | `.webp`, `.avif`, `.jpg` |
| `apache_iceberg_open_table_format` | Apache Iceberg Open Table Format & Snapshot Trees | Storage Engine | `.webp`, `.avif`, `.jpg` |
| `open_table_formats_lakehouse_architecture` | Open Table Formats Comparison (Delta vs Iceberg vs Hudi) | Storage Engine | `.webp`, `.avif`, `.jpg` |
| `open_file_formats_storage_architecture` | Open File Formats Comparison (Parquet vs ORC vs Avro) | Storage Engine | `.webp`, `.avif`, `.jpg` |
| `databricks_optimization_techniques_architecture` | 6 Delta Lake Optimization Levers (Partitioning, Z-Order, OPTIMIZE, Auto Optimize, Liquid Clustering, VACUUM) | Compute & Optimization | `.webp`, `.avif`, `.jpg` |
| `catalyst_photon_engine` | Databricks Compute: Catalyst Optimizer, AQE & Native Photon C++ Engine | Compute & Optimization | `.webp`, `.avif`, `.jpg` |
| `spark_shuffle_memory_execution` | Apache Spark Shuffle Internals & Unified JVM Memory | Compute & Optimization | `.webp`, `.avif`, `.jpg` |
| `sql_server_query_engine_optimization` | SQL Server Relational Engine & Buffer Pool Mechanics | Compute & Optimization | `.webp`, `.avif`, `.jpg` |
| `kimball_dimensional_star_schema` | Kimball Dimensional Modeling & Enterprise Star Schema | Data Modeling & Architecture | `.webp`, `.avif`, `.jpg` |
| `data_vault_enterprise_architecture` | Data Vault 2.0 Enterprise Modeling (Hubs, Links, Satellites) | Data Modeling & Architecture | `.webp`, `.avif`, `.jpg` |
| `enterprise_edge_architecture` | Enterprise Edge Computing, IoT Hub & Distributed Gateways | Platform Landscape | `.webp`, `.avif`, `.jpg` |
| `distributed_systems_resilience_architecture` | Distributed Systems Resilience & Circuit Breakers | Platform Landscape | `.webp`, `.avif`, `.jpg` |
| `python_arrow_polars_architecture` | Python High-Performance Data Engineering: Arrow, Polars & DuckDB | Compute & Optimization | `.webp`, `.avif`, `.jpg` |
| `data_mesh_enterprise_architecture` | Enterprise Data Mesh Architecture & Federated Governance | Data Modeling & Architecture | `.webp`, `.avif`, `.jpg` |
| `spark_data_skew_aqe_optimization` | Apache Spark Data Skew Handling & Adaptive Query Execution | Compute & Optimization | `.webp`, `.avif`, `.jpg` |
| `lakehouse_finops_cost_optimization` | Enterprise Lakehouse FinOps & Cloud Cost Optimization | Compute & Optimization | `.webp`, `.avif`, `.jpg` |
| `databricks_dabs_devops_pipeline` | Databricks Asset Bundles (DABs) & Serverless CI/CD | Platform Landscape | `.webp`, `.avif`, `.jpg` |
| `databricks_master_architecture` | Databricks End-to-End Lakehouse Master Blueprint | Platform Landscape | `.webp`, `.avif`, `.jpg` |

---

## 4. Standard Dev Commands, Testing & Vercel Guardrail

```bash
# 1. Run full test suite (must ALWAYS pass all 37 test files and 326 tests)
npm test -- --run

# 2. Production build check (must complete in <2s with 0 TS errors)
npm run build

# 3. Verify JSON integrity
python3 -c "import json; d=json.load(open('src/data/json/data_concepts.json')); print('Concepts:', len(d))"

# 4. Git commit & sync to repository
git add -A
git commit -m "feat/fix/chore(scope): detailed description"
git push origin main
```

> [!CAUTION]
> **CRITICAL VERCEL DEPLOYMENT RULE**:
> **DO NOT** run `npx vercel` or push deployments to Vercel unless explicitly instructed by the user in that prompt. Always sync changes to Git without deploying to Vercel unless the user says "deploy to vercel" or similar.

---

## 5. UI Architecture Patterns

### UnifiedSearchFilterBox (`src/components/ui/unified-search-filter-box.tsx`)
Multi-level accessible filter deck replacing fragmented single dropdowns:
- **Level 1**: Ecosystem Tabs (All, Databricks, Apache Airflow, Fabric, Delta Lake, etc.).
- **Level 2**: Sub-Topic Scenarios Grid (Responsive card buttons with item counts).
- **Level 3**: Difficulty & Refinement Pills (All, Easy, Medium, Hard, Architect).
- **Level 4**: Active Filter Chips with 1-click Reset.
- **Keyboard Shortcuts**: `/` to focus search, `Esc` to clear/blur, `Shift+E` for Read All mode.

### ConceptsMindmapView (`src/components/concepts/concepts-mindmap-view.tsx`)
Dynamic multi-level stretching mind map linking concepts across 13 core architectural topics and 44 subtopics:
- 4 Stretch Depths: L1 (Pillars), L2 (Subtopics), L3 (Full Leaf Concepts), L4 (Deep Mechanisms).
- Two layout modes: Tree Branching vs. Pillar Card Matrix.
- Concept Detail Inspector modal with official definitions and key engineering points.

---

## 6. Deep-Link URL Patterns

| Page | URL Pattern |
| :--- | :--- |
| **Concepts Hub** | `/concepts?tab=concepts&category=APACHE+AIRFLOW&term=DAG` |
| **Mind Map** | `/mindmap?topic=databricks&depth=3&mode=tree` |
| **Q&A Prep** | `/qa-prep?category=AIRFLOW&card=airflow-q-001` |
| **Architecture Hub** | `/architecture?category=Apache+Airflow+Architecture&card=arch-airflow-001` |
| **Guided Learning** | `/guided-learning?topic=airflow` |
| **Company Research** | `/company-research?company=Microsoft` |
| **Code Practice** | `/code-practice?category=pyspark` |
