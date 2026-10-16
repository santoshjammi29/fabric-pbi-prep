# Development, Testing, & Operations Guide: `fabric-pbi-prep`

Welcome to the **fabric-pbi-prep** developer and contributor guide. This document details the modern Next.js 16 App Router architecture, Server-Side Data Access Layer (DAL), automated Vitest test suite, and release workflows.

---

## 1. Project Architecture

The platform is built as an enterprise-grade cloud educational portal leveraging Next.js 16 App Router, React 19 Server Components, and Tailwind CSS. It enforces a strict **Zero-Bundle Data Mandate** to ensure blazing client-side performance even with over 10,700 learning records.

```
/Users/santosh/Documents/antigravity/adventurous-raman/
├── src/
│   ├── app/                         # Next.js 16 App Router routes
│   │   ├── page.tsx                 # Landing page & Whiteboard Showcase
│   │   ├── guided-learning/         # Cross-section progressive topic journeys
│   │   ├── concepts/                # Key concepts (622 concepts & Databricks 100)
│   │   ├── qa-prep/                 # Q&A practice (3,207 core + 3,597 DE questions)
│   │   ├── architecture/            # Architecture scenarios (3,200 scenarios) & 32 blueprints
│   │   ├── code-practice/           # PySpark / Spark SQL / Python code benchmarks
│   │   ├── cheat-sheet/             # Vector PDFs, posters, and code cards
│   │   ├── spark-engine/            # Spark memory, shuffle, Catalyst & Photon
│   │   ├── company-research/        # 156 Hyderabad & Bangalore GCC profiles
│   │   ├── learning-paths/          # Certification paths (DP-600, DP-203, PL-300, Databricks)
│   │   └── api/search/route.ts      # Edge SWR multi-word fuzzy search handler
│   ├── components/                  # Reusable UI primitives and layout components
│   ├── data/
│   │   ├── json/                    # Canonical JSON datasets (10,700+ records)
│   │   ├── diagrams.ts              # 32 Whiteboard Architecture Blueprints catalog
│   │   ├── guided-learning-topics.ts# Topic configurations for /guided-learning
│   │   └── index.ts                 # Standardized exports & domain mapping
│   ├── lib/
│   │   ├── dal.ts                   # React 19 cache() Server Data Access Layer
│   │   ├── search-engine.ts         # Universal multi-word fuzzy search engine
│   │   └── guided-learning.ts       # Cross-section aggregation engine
│   ├── workers/                     # Web Workers for SIMD vector compute
│   └── __tests__/                   # 32 Vitest test suites (298 tests)
├── public/
│   └── diagrams/                    # Lossless WebP, AVIF, and JPG whiteboard blueprints
└── docs/                            # Deep-dive guides & Knowledge Base
```

---

## 2. Data File Inventory & Schemas

All canonical datasets reside in `src/data/json/`:

| File | Primary Type | Item Count | Key Fields |
| :--- | :--- | :--- | :--- |
| `data_concepts.json` | `Concept[]` | **622** | `id`, `term`, `category`, `difficulty`, `definition`, `explanation`, `keyPoints[]` |
| `databricks_100.json` | `Databricks100Item[]` | **100** | `num`, `day`, `concept`, `category`, `difficulty`, `whatYouShouldKnow`, `code`, `cert`, `keyPoints[]` |
| `data_architecture.json` | `ArchitectureQuestion[]` | **3,200** | `id`, `source`, `category`, `niche`, `difficulty`, `question`, `answer` |
| `data_de.json` | `Question[]` | **3,597** | `id`, `source`, `category`, `niche`, `difficulty`, `question`, `answer`, `domain` |
| `questions.json` | `Question[]` | **3,207** | `id`, `source`, `category`, `niche`, `difficulty`, `question`, `answer` |
| `company_profiles.json` | `CompanyProfile[]` | **156** | `id`, `name`, `industry`, `tier`, `techStack[]`, `salaryRange`, `interviewFocus` |
| `databricks_cheatsheets.json`| `CheatSheetSuite[]` | **6 (48 cards)** | `suiteId`, `title`, `sections[]`, `codeBlocks[]`, `pdfUrl`, `posterUrl` |
| `data_pyspark.json` | `CodeSheetItem[]` | **43** | `id`, `title`, `level`, `category`, `description`, `code` |
| `data_sparksql.json` | `CodeSheetItem[]` | **44** | `id`, `title`, `level`, `category`, `description`, `code` |

### Difficulty Enum:
`'EASY' | 'MEDIUM' | 'HARD' | 'ARCHITECT'`

### Standardized Domain Categories (`getStandardizedDomain`):
- `Compute & Orchestration`: Databricks, Apache Spark, Apache Airflow
- `Data Pipelines & Ingestion`: Azure Data Factory (ADF), dbt, Kafka, CDC
- `Storage Engine & Lakehouse`: OneLake, Delta Lake, Apache Iceberg, Storage
- `Semantic & BI`: Power BI, DAX, Fabric Semantic Models
- `Governance & Quality`: Microsoft Purview, Unity Catalog, Data Quality

---

## 3. High-Performance Engineering Patterns

### 3.1 Zero-Bundle Server Components
Direct client imports of `src/data/json` are prohibited. Instead, page components use Server Components or route handlers via `src/lib/dal.ts` with React 19 `cache()` request deduplication.

### 3.2 TanStack Virtual List Rendering
Lists containing hundreds or thousands of cards (`/qa-prep`, `/concepts`, `/architecture`) consume `@tanstack/react-virtual` with fixed or dynamic row heights, guaranteeing smooth 60 FPS scrolling and minimal DOM nodes.

### 3.3 Web Worker Offloading
Heavy compute tasks (1536-dimensional vector distance calculations for RAG simulations) run in background threads (`src/workers/compute.worker.ts`), preventing main thread freezing.

---

## 4. Automated Testing Suite (Vitest)

Our automated verification suite enforces 100% test passing across 32 test files before any pull request or deployment:

```bash
# Run all 32 test suites in single-run mode
npm test -- --run

# Run in watch mode during feature development
npm test
```

### Verified Test Categories:
1. **Data Integrity (`src/__tests__/data.integrity.test.ts`)**: Schema compliance, unique ID validation, non-empty fields, and difficulty rating integrity.
2. **Domain Helpers (`src/__tests__/data.helpers.test.ts`)**: `getStandardizedDomain`, topic counters, and category mappings.
3. **Route Handlers (`src/__tests__/data.routes.test.ts`)**: Server-side data routes and search API edge responses.
4. **Universal Search (`src/__tests__/features.universal-search.test.ts`)**: Multi-word tokenization, ranking algorithms, and fuzzy search accuracy.
5. **Guided Learning (`src/__tests__/guided-learning.test.ts`)**: Topic item aggregation across questions, concepts, and blueprints.
6. **Responsive Uniformity (`src/__tests__/features.responsive-uniformity.test.ts`)**: Mobile, tablet, desktop breakpoint audits.
7. **Component Primitives**: Smooth accordion, breadcrumbs, focus traps, and beginner rail tests.

---

## 5. Build & Deployment Lifecycle

```bash
# 1. Type checking and production Next.js build
npm run build

# 2. Automated test run
npm test -- --run

# 3. Deploy to Vercel production
npx vercel --prod --yes
```

---

[← Back to Engineering Directory](./README.md) • [Documentation Hub](../README.md)

