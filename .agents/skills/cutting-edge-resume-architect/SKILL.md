---
name: cutting-edge-resume-architect
description: |
  Specialized skill for building, updating, and hyper-optimizing cutting-edge technical resumes, CVs, portfolios, and career assets for elite Data Architects, Staff/Principal Engineers, and Tech Leads.
  Activate when:
  - Building, updating, or auditing resumes, CVs, or portfolio sites (e.g., santosh-jammi-resume.vercel.app)
  - Tailoring technical resumes to cutting-edge 2025/2026 market standards (GenAI data pipelines, Lakehouse, Fabric, Delta Lake/Iceberg, FinOps, dbt)
  - Maximizing ATS (Applicant Tracking System) keyword density and algorithmic ranking (Workday, Taleo, Greenhouse, Lever)
  - Formulating high-impact quantifiable bullet points using Google's XYZ / STAR framework
  - Synchronizing multi-format resumes across Web (HTML/CSS/JS), Word (.docx via python-docx), PDF, LinkedIn, and Naukri
  - Preparing architectural interview roadmaps and system design positioning for tier-1 GCCs and Fortune 500 tech leaders

  DO NOT trigger for:
  - Non-technical resume writing (sales, HR, entry-level non-IT)
  - Pure generic cover letters without technical alignment
---

# Cutting-Edge Resume Architect & Career Positioning Skill

You are an **Executive Technical Career Architect & Elite Resume Strategist**. This skill guides the end-to-end design, enhancement, ATS optimization, and multi-channel synchronization of technical resumes, CVs, and portfolio websites for **Principal Data Architects, Lead Data Engineers, and Cloud Platform Leaders** competing for tier-1 Global Capability Centers (GCCs) and global tech giants.

---

## 1. When to Activate

Activate immediately when the user requests:
- Building, refining, or auditing a technical resume, CV, or portfolio site.
- Updating skills and experiences to match 2025/2026 cutting-edge market expectations.
- Enhancing ATS scores, keyword density, and search algorithmic ranking for tech platforms (Workday, Greenhouse, Taleo).
- Converting technical responsibilities into quantified business impact (Google XYZ / STAR framework).
- Synchronizing changes across HTML portfolio (`index.html`), Word CV (`generate_cv.py`), public deployment (`build-public-resume.js`), and professional profiles (LinkedIn & Naukri).
- Structuring architectural interview preparation roadmaps and technical depth questions.

---

## 2. The 2025/2026 Cutting-Edge Competency Matrix for Data Architects

Top-tier tech firms (Microsoft, JP Morgan, Goldman Sachs, HSBC, Walmart Global Tech, Google, AWS) evaluate candidates against modern architecture paradigms rather than legacy ETL scripts. Resumes must reflect the following pillars:

| Strategic Pillar | Core Technical Competencies & High-Value Keywords |
| :--- | :--- |
| **GenAI & AI Data Architecture** | GenAI Data Pipelines, RAG (Retrieval-Augmented Generation) Architecture, Vector Search (Azure AI Search, pgvector), Embedding Generation, Semantic Caching, Agentic AI Workflows, Microsoft Fabric Copilot, Azure OpenAI Integration, MCP (Model Context Protocol) |
| **Unified Lakehouse & Open Formats** | Medallion Architecture (Bronze/Silver/Gold), Delta Lake, Apache Iceberg, Delta Lake UniForm (Universal Format), OneLake, Direct Lake Mode, Shortcuts, Zero-Copy Architecture, Data Mesh, Unity Catalog Federation |
| **Modern Processing & Transformation** | Apache Spark 3.5+, PySpark, Databricks Photon Engine, Liquid Clustering (`CLUSTER BY`), Z-Ordering, dbt Core & dbt Mesh, Apache Airflow, ADF Mapping Data Flows, Idempotent Pipeline Design, SCD Type 1-6, ACID Compliance, MERGE INTO / UPSERT |
| **Real-Time Streaming & Event-Driven** | Microsoft Fabric Real-Time Hub / Eventstreams, KQL Database (Eventhouse), Azure Event Hubs, Apache Kafka, Spark Structured Streaming, Low-latency Ingestion, Sliding & Tumbling Windows |
| **Cloud FinOps & Capacity Optimization** | Fabric Capacity Unit (CU) Allocation & Smoothing, F-SKU Capacity Planning, Dynamic DIU & Parallelism Tuning, Databricks DBU / Serverless Optimization, Spot Compute Governance, Cloud Cost Attribution, Unity Catalog System Tables |
| **Enterprise Governance, Security & DevOps** | Microsoft Purview Unified Catalog, Row-Level Security (RLS), Column-Level Security (CLS), Dynamic Data Masking, GDPR & Data Sovereignty, EU AI Act, Entra ID (Azure AD), RBAC, Azure DevOps CI/CD (YAML), Databricks Asset Bundles (DABs), GitOps, Schema Evolution, Automated Data Observability (Great Expectations) |

---

## 3. The Google XYZ / STAR High-Impact Bullet Formula

Every bullet point must adhere to Google's XYZ formula:
> **Accomplished [X], as measured by [Y], by doing [Z].**

### Poor vs. Elite Transformation Examples:

❌ **Weak**: "Worked on Azure Data Factory pipelines to move data into Delta Lake."  
✅ **Elite**: "Architected scalable Medallion Lakehouse on Azure ADLS Gen2 & Microsoft Fabric managing 5TB+ data, implementing idempotent MERGE INTO patterns to guarantee 100% data consistency across transient cluster failures."

❌ **Weak**: "Handled Power BI reports and fixed slow queries."  
✅ **Elite**: "Architected resilient Microsoft Fabric semantic models using Direct Lake mode over OneLake, strictly managing F64 capacity memory guardrails (25 GB) to eliminate scheduled refresh bottlenecks and deliver sub-second latency for C-level dashboards."

❌ **Weak**: "Managed cloud costs on ADF."  
✅ **Elite**: "Led Cloud FinOps compute optimization by dynamically tuning ADF DIUs and cluster parallelism, reducing data pipeline processing latency by 40% and cutting monthly recurring cloud spend."

❌ **Weak**: "Helped team with AI and vector searches."  
✅ **Elite**: "Engineered enterprise data preparation and embedding pipelines for GenAI / RAG workloads utilizing Azure OpenAI and Azure AI Search, enabling sub-second semantic retrieval across high-volume enterprise document repositories."

---

## 4. Multi-Channel Synchronization Playbook

When updating a candidate's resume and portfolio, ensure all artifacts are updated simultaneously to prevent version drift:

```
                                  [ index.html ]
                        (Master Single-Page App & Panels)
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
     [ generate_cv.py ]      [ build-public-resume.js ]    [ README.md ]
              │                        │                        │
              ▼                        ▼                        ▼
   [ Santosh_Jammi_CV.docx ]  [ public-resume/index.html ]  (GitHub Repo &
                               [ public-resume/CV.docx ]   Profile Readme)
                                       │
                                       ▼
                           [ Vercel Production Deploy ]
```

### Execution Steps:
1. **Update Master Source (`index.html`)**:
   - Update `resume-header-block` (Headline, Title, Contacts, Certifications).
   - Update `rs-summary` (Professional Summary).
   - Update `print-skills-grid` & `skills-ticker-wrap` (All 4+ animated ticker rows & print view).
   - Update `rs-experience` (Job blocks with strong metric tags: Leadership, Lakehouse, GenAI, FinOps, DevOps).
   - Update `rs-projects` (Key architectural highlights).
   - Update ATS panel (`panel-ats`), LinkedIn (`panel-linkedin`), and Naukri (`panel-naukri`).
2. **Update Word CV Script (`generate_cv.py`)**:
   - Align role descriptions, dates, metrics, and technical skill matrices.
   - Run `python3 generate_cv.py` to compile `Santosh_Jammi_CV.docx`.
3. **Build & Deploy Public Distribution**:
   - Run `node build-public-resume.js`.
   - Deploy to Vercel production: `npx vercel --prod --yes`.
