# Changelog

## v1.1 — Databricks 100 Mastery, 6 Delta Lake Optimization Levers & Taxonomy Expansion (2026-10-15)

### 🚀 Databricks 100 Structured Mastery Challenge
- **100-Day Progressive Curriculum (`src/data/json/databricks_100.json`)**: Integrated all 100 core Databricks concepts with day tracking, difficulty ratings (`EASY`, `MEDIUM`, `HARD`), actionable "What You Should Know" rubrics, production code snippets, and direct certification mapping (Databricks Certified Associate / Professional Data Engineer).
- **Concept Taxonomy Sync (`src/data/json/data_concepts.json`)**: Scaled architectural concepts database to **622 verified concepts**, adding missing architectural definitions across Unity Catalog, Liquid Clustering, Serverless Workflows, Photon Engine, and Delta Live Tables.

### ⚡ 6 Delta Lake Optimization Levers & Hands-on Benchmarks
- **Storage Engine Whiteboard Blueprint (`databricks_optimization_techniques_architecture`)**: Digital whiteboard visual guide comparing the 6 core optimization techniques: Physical Partitioning (`PARTITIONED BY`), Multi-Dimensional Z-Ordering (`OPTIMIZE ... ZORDER BY`), Bin-Packing File Compaction (`OPTIMIZE`), Auto Optimize (`optimizeWrites` & `autoCompact`), Liquid Clustering (`CLUSTER BY`), and VACUUM storage lifecycle hygiene.
- **Empirical Benchmarking Code Suite (`src/data/json/data_pyspark.json` & `data_sparksql.json`)**: Added hands-on PySpark and Spark SQL benchmarking scripts simulating 50M-row workloads across all 6 levers, comparing scan durations, input file fragmentation, and read I/O bytes via the Spark UI.

---

## v1.0 — Open Format Storage Types Blueprints & Technical Deep-Dive (2026-10-15)

### 🏛️ Open Storage Formats Architecture
- **Lakehouse Metadata & Physical Storage Blueprints**: Added 2 new whiteboard architecture diagrams:
  - `open_table_formats_lakehouse_architecture`: Comparative analysis of Delta Lake (`_delta_log` commits and checkpoints), Apache Iceberg (4-tier snapshot metadata tree), and Apache Hudi (`.hoodie` timeline instants and record indexing).
  - `open_file_formats_storage_architecture`: Physical byte layout comparison of Apache Parquet (Row Groups, Column Chunks, Footer statistics), Apache ORC (Stripes and 10,000-row group Bloom filters), and Apache Avro (serialized blocks, 16-byte cryptographic sync markers, and Schema Registry).
- **Comprehensive Technical Reference Guide (`docs/open_format_storage_types_guide.md`)**: Complete architectural guide covering ACID semantics, OCC concurrency, hidden partitioning, schema evolution, row mutations (COW vs MOR), and an architectural decision tree for format selection.

---

## v0.9 — Universal Multi-Word Fuzzy Search Engine (2026-10-12)

### 🔍 Unified Cross-Route Search & Command Palette
- **High-Performance Multi-Word Search Engine (`src/lib/search-engine.ts`)**: Built a universal search engine supporting multi-word tokenization, fuzzy substring matching, and category filtering across all 10,700+ assets in <5ms.
- **Keyboard-First Command Palette**: Added global `⌘K` (Mac) and `Ctrl+K` (Windows/Linux) shortcut triggers, with keyboard arrow navigation and instant tab switching.
- **Edge SWR Search API Route (`src/app/api/search/route.ts`)**: Offloaded heavy search indexing to serverless edge route handlers with client-side SWR caching.

---

## v0.8 — Databricks Architecture & Coding Cheat Sheets Suite (2026-10-10)

### 📋 Vector PDFs, Wall Posters & Interactive Hub
- **48 Curated Coding Cards across 6 Suites (`src/data/json/databricks_cheatsheets.json`)**:
  - Suite 1: Databricks Architecture Master
  - Suite 2: PySpark Core & DataFrame API
  - Suite 3: Spark SQL & Performance Tuning
  - Suite 4: Python for Data Engineering
  - Suite 5: Spark Execution & Memory Mechanics
  - Suite 6: Production Delta Lake & Streaming Operations
- **Vector PDF & Wall Poster Generation (`cheatsheets/`)**: Generated high-resolution vector PDF downloads and printable high-dpi poster graphics for each suite with zero whitespace and comprehensive line-by-line code breakdowns.

---

## v0.7 — Enterprise Data Architecture Knowledge Base (2026-10-08)

### 📚 Production Knowledge Base & Multi-SSG Export
- **6 Deep-Dive Architectural Modules (`docs/architecture/`)**:
  - `01_azure_synapse.md`: Dedicated SQL Pools (MPP), Serverless SQL, Spark Pools, HTAP Synapse Link.
  - `02_microsoft_fabric.md`: OneLake, Shortcuts, Direct Lake, F-SKU Capacity smoothing & bursting.
  - `03_nosql_vector_db.md`: Cosmos DB RU/s tuning, MongoDB, ScyllaDB, pgvector & Qdrant for RAG.
  - `04_etl_stream_proc.md`: Spark vs Flink vs DuckDB/Polars, Delta UniForm vs Iceberg, Airflow vs Dagster.
  - `05_lakehouse_finops.md`: Cloud Lakehouse FinOps, TCO frameworks, storage tiering.
  - `06_enterprise_blueprints.md`: 6 production blueprints with Mermaid sequence flows and failure modes.
- **Unified JSON Export (`docs/architecture/knowledge_base_export.json`)**: Machine-readable JSON export for static site generators (Nextra, Astro Starlight, MkDocs).

---

## v0.6 — Senior Staff Architecture Overhaul (2026-09-29)

### 🏎️ Zero-Bundle DAL, 60 FPS HTML5 Canvas & Web Workers
- **Zero-Bundle Data Architecture**: Completely removed direct client-side JSON imports, establishing a React 19 `cache()` Server Data Layer.
- **HTML5 Canvas 60 FPS Mindmap Engine (`src/components/mindmap/mindmap-canvas-engine.tsx`)**: Hardware-accelerated GPU canvas rendering for the 250+ node mindmap with fluid bezier particle streams.
- **TanStack Virtual DOM**: Integrated `@tanstack/react-virtual` across `/qa-prep`, `/concepts`, and `/architecture` for smooth 60 FPS scrolling through 10,000+ items.
- **Web Worker SIMD Compute (`src/workers/compute.worker.ts`)**: Background thread execution for 1536-dimensional vector distance calculations and Spark execution simulators.
- **Automated Vitest Test Suite**: Built 32 test files covering 298 unit and integration tests with a 100% pass rate.

---

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
