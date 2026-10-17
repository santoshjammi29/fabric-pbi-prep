---
name: whiteboard-architecture-diagrams
description: |
  Specialized skill and guideline for generating educational, polished hand-drawn whiteboard sketch style architecture diagrams, system design workflows, and technical infographic images.
  Activate when:
  - The user asks to generate an architecture diagram, flow chart, pipeline diagram, or system design image.
  - The user requests an image explanation in "this style", "whiteboard style", "hand-drawn sketch style", or "diagram style".
  - Designing visual explanations of data engineering architectures, cloud platforms (Azure, Fabric, Databricks, AWS, GCP), storage engines, or technical under-the-hood mechanisms.
---

# Whiteboard Architecture Diagrams Skill & Guidelines

This skill enforces the exact visual and architectural style for generating **clean, educational, hand-drawn whiteboard sketch diagrams** for technical systems, cloud architectures, data pipelines, and internal mechanisms.

---

## 1. Visual Style & Aesthetic Specifications

| Element | Specification |
| :--- | :--- |
| **Canvas Background** | Pure solid white (`#FFFFFF`) with high contrast. Never use dark mode, textures, or isometric grids. |
| **Art Style** | Polished digital whiteboard sketch with friendly hand-drawn marker linework and crisp borders. |
| **Containers / Cards** | Rounded rectangular boxes with visible 2-3px hand-drawn outlines and light pastel background fills. |
| **Typography** | Friendly, legible marker handwriting script for titles/headers; clean sans-serif for subtexts and bullets; monospace on light grey cards for code snippets. |
| **Logos & Icons** | Recognizable official cloud & tech icons (Databricks, Spark, Airflow, Azure Data Factory, Unity Catalog, storage cylinders, folders, lock icons, checkmarks). |
| **Arrow Semantics** | • **Dashed arrows (`- - - ->`)**: Control flow, triggers, job dispatches, metadata sync, reporting.<br>• **Solid arrows (`──────>`)**: Data flow, data reading, writing, transformations, payloads. |

### Semantic Color Palette

Use consistent semantic colors across components:
- **Red / Coral** (`#E03131` / light red fill): Schedulers, master orchestrators, and compute clusters (e.g., Apache Airflow, Azure Databricks, Spark, Flink).
- **Blue / Sky** (`#1971C2` / light blue fill): Execution dispatchers, conversion engines, and middleware (e.g., Azure Data Factory, Step Functions, dbt, conversion processors).
- **Yellow / Amber** (`#F08C00` / light yellow fill): Sources, raw landing zones, unmanaged files, and input datasets (e.g., Plain Parquet, ADLS Raw, S3 landing, Kafka topics).
- **Purple / Violet** (`#9C36B5` / light purple fill): Governance, catalogs, data access control, and quality centers (e.g., Unity Catalog, Collibra, DTC, Microsoft Purview, Great Expectations).
- **Green / Emerald** (`#2B8A3E` / light green fill): Target lakehouse tables, curated gold/silver layers, completed outputs, and unlocked features (e.g., Delta Parquet, Iceberg tables, verified badges).

---

## 2. Core Layout Archetypes

### Archetype A: Dual-Plane Enterprise Flow (Control Flow vs. Data Flow)
Use when explaining end-to-end production pipelines spanning orchestrators, compute, and governance.

- **Top Swimlane — Orchestration / Control Flow**:
  - Master scheduler (e.g., Airflow) triggers the workflow dispatcher (e.g., ADF).
  - Dispatcher triggers compute job (Databricks / Fabric Spark) via vertical downward dashed line.
  - Dispatcher triggers post-processing reporting and governance updates (e.g., Microsoft Purview, Unity Catalog).
- **Bottom Swimlane — Storage & Processing / Data Flow**:
  - Source storage (ADLS Gen2 / S3 / Kafka) read by compute engine.
  - Compute passes through Governance / Security catalog (Unity Catalog / Purview).
  - Governance routes writes to target storage layers (Bronze, Silver, Gold Delta / Iceberg).
- **Bottom-Left Legend**:
  - `- - - ->` Control flow
  - `──────>` Data flow

### Archetype B: 3-Panel Mechanism / Under-the-Hood Explanation
Use when explaining how a specific file format, algorithm, or conversion works step-by-step.

- **Left Panel (Yellow/Amber)**: *Starting State* (e.g., Plain Parquet files, directory contents, limitations: no ACID, no MERGE).
- **Center Panel (Blue)**: *Conversion Engine / Transition* (e.g., Spark/Databricks zero-copy engine, code command box, metadata scanning actions).
- **Right Panel (Green)**: *Resulting State* (e.g., Delta Parquet table showing `_delta_log/` + data files, badges with checkmarks for unlocked features: ACID, Time Travel, DML, Liquid Clustering).

---

## 3. Formula for `generate_image` Prompts

When invoking the `generate_image` tool, construct the prompt following this exact template:

```python
{
    "AspectRatio": "16:9",  # Use 16:9 for horizontal flows/swimlanes, 4:3 for compact maps
    "ImageName": "<descriptive_snake_case_name>",
    "ImagePaths": [
        # Pass the sample reference images stored in this skill's resources
        "/Users/santosh/antigravity/.agents/skills/whiteboard-architecture-diagrams/resources/sample_enterprise_pipeline.jpg"
    ],
    "Prompt": """
A clear, high-resolution digital architecture and infographic diagram explaining '<TOPIC_TITLE>' in a polished hand-drawn whiteboard sketch style on a clean white background, strictly matching the visual style, rounded colored cards, and friendly marker typography of the reference image.

Title at top: '<MAIN_TITLE>'
Subtitle below: '<SUBTITLE_OR_CONTEXT>'

[STRUCTURE & LAYOUT SPECIFICATION]:
- Specify swimlanes or horizontal panels.
- For each box, explicitly define:
  1. Box color and fill (Red, Blue, Yellow, Purple, Green).
  2. Main label and icon (Airflow pinwheel, Databricks stacked diamonds, etc.).
  3. Subtext bullets and exact text lines.
- Specify every connecting arrow:
  - Dashed arrow for Control Flow / triggers / signals.
  - Solid arrow for Data Flow / reads / writes.
  - Text label on the arrow (e.g., 'Trigger', 'Read', 'Job activity', 'CONVERT TO DELTA').

[FOOTER / LEGEND]:
- Legend in bottom-left corner defining arrow semantics.

Clean linework, vibrant colored borders, high contrast, perfectly legible hand-drawn typography.
"""
}
```

---

## 4. Enterprise Whiteboard Blueprints Catalog (32 Production Blueprints)

The platform maintains an authoritative catalog of 32 digital whiteboard architecture diagrams, persisted in `public/diagrams/`:

1. `fabric_onelake_architecture`: Microsoft Fabric Unified Architecture & OneLake Storage Substrate
2. `powerbi_direct_lake_vertipaq`: Power BI Direct Lake Mode & VertiPaq In-Memory Semantic Engine
3. `powerbi_dax_engine_context`: Power BI DAX Formula/Storage Engine Mechanics & Context Transition
4. `apache_airflow_architecture`: Apache Airflow Distributed Architecture, Schedulers & Executors
5. `dbt_analytics_engineering_dag`: dbt Analytics Engineering DAG, Mesh & Transformation Framework
6. `adf_hybrid_architecture`: Azure Data Factory Hybrid Pipeline & Self-Hosted Integration Runtime (SHIR)
7. `kafka_event_streaming_pipeline`: Apache Kafka Event Streaming, Partitions & High-Throughput Messaging
8. `cdc_debezium_lakehouse_pipeline`: Change Data Capture (CDC) with Debezium & Streaming Lakehouse Ingestion
9. `databricks_medallion_architecture`: Databricks Multi-Hop Medallion Architecture (Bronze/Silver/Gold)
10. `databricks_dlt_pipeline`: Databricks Delta Live Tables (DLT) Declarative ETL & Expectations Pipeline
11. `databricks_ecosystem_landscape`: Databricks Platform Landscape & Core Engine Overview
12. `rag_vector_search_data_pipeline`: Enterprise RAG & Vector Search Data Ingestion Pipeline
13. `unity_catalog_architecture`: Databricks Unity Catalog Centralized Governance, Access Control & Lineage
14. `purview_governance_catalog`: Microsoft Purview Enterprise Unified Governance, Classification & Metadata
15. `delta_lake_mechanism`: Delta Lake Under-The-Hood ACID Transaction Mechanics & Checkpointing
16. `apache_iceberg_open_table_format`: Apache Iceberg Open Table Format, Snapshot Trees & Hidden Partitioning
17. `open_table_formats_lakehouse_architecture`: Open Table Formats Comparison (Delta Lake vs Iceberg vs Hudi)
18. `open_file_formats_storage_architecture`: Open File Formats Comparison (Parquet vs ORC vs Avro)
19. `databricks_optimization_techniques_architecture`: 6 Delta Lake Optimization Techniques (Partitioning, Z-Order, OPTIMIZE, Auto Optimize, Liquid Clustering, VACUUM)
20. `catalyst_photon_engine`: Databricks Compute: Catalyst Optimizer, AQE & Native Photon C++ Engine
21. `spark_shuffle_memory_execution`: Apache Spark Shuffle Internals & Unified JVM Memory Architecture
22. `sql_server_query_engine_optimization`: SQL Server Relational Engine, Query Optimizer & Buffer Pool Mechanics
23. `kimball_dimensional_star_schema`: Kimball Dimensional Modeling & Enterprise Star Schema Design
24. `data_vault_enterprise_architecture`: Data Vault 2.0 Enterprise Modeling (Hubs, Links, Satellites)
25. `enterprise_edge_architecture`: Enterprise Edge Computing, IoT Hub & Distributed Gateways
26. `distributed_systems_resilience_architecture`: Distributed Systems Resilience, Circuit Breakers & Consensus
27. `python_arrow_polars_architecture`: Python High-Performance Data Engineering: Apache Arrow, Polars & DuckDB
28. `data_mesh_enterprise_architecture`: Enterprise Data Mesh Architecture (Domain Ownership & Data Products)
29. `spark_data_skew_aqe_optimization`: Apache Spark Data Skew Handling & Adaptive Query Execution (AQE)
30. `lakehouse_finops_cost_optimization`: Enterprise Lakehouse FinOps & Cloud Compute/Storage Cost Optimization
31. `databricks_dabs_devops_pipeline`: Databricks Asset Bundles (DABs) & Serverless CI/CD Architecture
32. `databricks_master_architecture`: Databricks End-to-End Enterprise Lakehouse Architecture Master Blueprint

---

## 5. WebP & AVIF Multi-Format Optimization

All diagram outputs are automatically converted from source JPG to modern `.webp` and `.avif` formats via `scripts/convert_diagrams_avif_webp.py` to achieve 60-80% smaller payloads and instant client-side rendering.
