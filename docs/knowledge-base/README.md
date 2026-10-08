# Enterprise Data Architecture Knowledge Base

> **Authoritative Reference & Architectural Walkthrough Guide**  
> Covering Azure Synapse Analytics, Microsoft Fabric, Modern NoSQL & Vector Databases, Modern ETL/ELT Applications, Big Data FinOps, and Production Practice Scenarios.

---

## 📚 Knowledge Base Structure & Contents

This repository contains an export-ready, production-grade knowledge base designed for data architects, principal data engineers, and engineering leaders. It is structured into deep-dive technical modules that can be exported directly or converted into an interactive walkthrough website using static site generators (Next.js, Astro Starlight, Docusaurus, VitePress, or MkDocs).

| Module | Title | Primary Focus Areas | File |
| :--- | :--- | :--- | :--- |
| **01** | **Azure Synapse Architecture Deep-Dive** | Dedicated SQL Pools (MPP), Serverless SQL, Spark Pools, Synapse Link HTAP, Managed VNet, WLM, skews, enterprise success stories. | [`01_azure_synapse_architecture.md`](./01_azure_synapse_architecture.md) |
| **02** | **Microsoft Fabric Architecture Mastery** | SaaS vs PaaS, OneLake Shortcuts, Lakehouse vs Warehouse, Direct Lake Power BI, Eventhouse/KQL, F-SKU Capacity, Smoothing/Bursting, Migration. | [`02_microsoft_fabric_mastery.md`](./02_microsoft_fabric_mastery.md) |
| **03** | **Modern NoSQL & Vector Databases** | Cosmos DB (RU/s optimization, multi-region write), MongoDB, ScyllaDB/Cassandra, DynamoDB, Vector DBs (Qdrant, Milvus, pgvector) for RAG. | [`03_modern_nosql_and_vector_databases.md`](./03_modern_nosql_and_vector_databases.md) |
| **04** | **Modern ETL/ELT & Stream Processing** | Spark 3.5+ vs Flink vs DuckDB + Polars in-process, Delta Lake UniForm vs Iceberg vs Hudi, Kafka vs Event Hubs, Airflow vs Dagster, dbt Core/Cloud. | [`04_modern_etl_elt_applications.md`](./04_modern_etl_elt_applications.md) |
| **05** | **Revenue-Generating & Cost-Effective FinOps** | TCO frameworks, Serverless vs Provisioned break-even curves, Storage tiering, High-revenue monetization patterns, Cost-optimized architectures. | [`05_revenue_generating_vs_cost_effective_finops.md`](./05_revenue_generating_vs_cost_effective_finops.md) |
| **06** | **Architectural Practice & Walkthroughs** | 6 End-to-End Enterprise Blueprints with Mermaid diagrams, failure modes, trade-off matrices, anti-patterns, and debugging playbooks. | [`06_architectural_practice_walkthroughs.md`](./06_architectural_practice_walkthroughs.md) |
| **Data** | **Unified Machine-Readable JSON Export** | Full structured JSON dataset with metadata, schema tags, questions, and code snippets for automated website build and vector indexing. | [`knowledge_base_export.json`](./knowledge_base_export.json) |

---

## 🚀 How to Export and Build a Website with this Knowledge Base

### Option 1: Next.js (App Router / Nextra / Contentlayer)
1. Copy the `docs/knowledge-base/` folder into your Next.js project's `content/` or `src/content/` directory.
2. In Next.js with **Nextra 4** or **Contentlayer**:
   ```bash
   npm i nextra nextra-theme-docs
   ```
3. Map each markdown file to a dynamic route `/docs/[slug]` with syntax highlighting enabled.

### Option 2: Astro Starlight (Ultra-Fast Static Site)
1. Initialize Starlight:
   ```bash
   npm create astro@latest -- --template starlight
   ```
2. Move all `.md` files into `src/content/docs/`.
3. Build and deploy static assets with 100% Lighthouse score:
   ```bash
   npm run build
   ```

### Option 3: Python MkDocs Material
1. Install MkDocs Material:
   ```bash
   pip install mkdocs-material mkdocs-mermaid2-plugin
   ```
2. Configure `mkdocs.yml`:
   ```yaml
   site_name: Data Architecture Masterclass
   theme:
     name: material
     palette:
       scheme: slate
       primary: deep purple
   plugins:
     - search
     - mermaid2
   nav:
     - Home: README.md
     - Azure Synapse: 01_azure_synapse_architecture.md
     - Microsoft Fabric: 02_microsoft_fabric_mastery.md
     - Modern NoSQL & Vector: 03_modern_nosql_and_vector_databases.md
     - Modern ETL/ELT: 04_modern_etl_elt_applications.md
     - Big Data FinOps: 05_revenue_generating_vs_cost_effective_finops.md
     - Architectural Walkthroughs: 06_architectural_practice_walkthroughs.md
   ```
3. Serve locally: `mkdocs serve` or build: `mkdocs build`.

### Option 4: Direct JSON Ingestion (`knowledge_base_export.json`)
The companion file `knowledge_base_export.json` contains:
- `modules`: Array of 6 deep-dive architectural modules with summary, target personas, and key takeaways.
- `blueprints`: Detailed architectural blueprints with problem statement, system components, trade-offs, and failure recovery.
- `concepts`: Key architectural concepts indexed by category, difficulty level, and keywords.
- `scenarios`: Interactive walkthrough questions with solutions and decision criteria.

You can import this JSON directly into:
- **Algolia / Meilisearch / Elasticsearch** for full-text search.
- **Qdrant / Pinecone / pgvector** for AI semantic search and RAG chatbots.
- **React / Svelte / Vue** components to power dynamic client-side filtering, interactive quiz modes, and scenario walk-throughs.

---

## 📖 Key Architectural Standards Adhered To
- **Microsoft Cloud Adoption Framework (CAF)** for Azure Fabric and Synapse governance, landing zones, and security perimeters.
- **Microsoft Azure Well-Architected Framework (WAF)** for Reliability, Security, Cost Optimization, Operational Excellence, and Performance Efficiency.
- **Fabric Customer Advisory Team (CAT)** production blueprints, Direct Lake sizing, and capacity smoothing guidelines.
- **Data Mesh & Medallion Lakehouse Standards** established across Netflix, Uber, Airbnb, and Microsoft engineering publications.
