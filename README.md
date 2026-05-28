# Microsoft Fabric & Power BI Interview Prep

An interactive single-page web app for preparing for Microsoft Fabric, Power BI, Azure Data Factory, SQL Server, Data Lake, and Apache Spark technical interviews.

## Features

- **Concept Explainer** — Browse all Q&As by category and topic with search and difficulty filter
- **Practice Mode** — Flashcard-style practice sessions grouped by niche topics
- **Spark Guide** — A deep-dive reference section on Apache Spark architecture
- **Progress Tracking** — Mark questions as Unseen / Reviewing / Mastered (saved to localStorage)
- **Dark & Light Theme** — Apple-inspired design with full theme switching
- **1,200+ Questions** — Across 6 domains: Fabric, Power BI, ADF, SQL Server, Data Lake, Spark

## Live App

Deployed on Vercel — see `.vercel/` for deployment configuration.

## Project Structure

```
fabric-pbi-prep/
├── index.html          # Main SPA
├── styles.css          # All CSS (CSS custom properties, dark/light theme)
├── app.js              # App logic (routing, rendering, progress tracking)
├── questions.js        # Compiled question database (~1.2MB, auto-generated)
├── package.json
│
├── data/               # Source JSON question files (source of truth)
│   ├── fabric_part1.json
│   ├── fabric_part2.json
│   ├── pbi_part1.json
│   ├── pbi_part2.json
│   ├── adf_part1.json
│   ├── adf_part2.json
│   ├── sql_part1.json
│   ├── sql_part2.json
│   ├── datalake_part1.json
│   ├── datalake_part2.json
│   ├── spark_part1.json
│   └── spark_part2.json
│
├── scripts/            # Developer tooling
│   ├── compile_db.py   # Merges data/*.json → questions.js
│   ├── README.md       # Build pipeline docs
│   └── generators/     # Scripts that produce data/*.json
│       └── batches/    # Historical batch injectors (archived)
│
└── tests/              # Puppeteer tests
    ├── test_dom.js
    ├── test_explainer.js
    ├── test_portal.js
    └── test_ui.js
```

## Development

### Rebuild question database
After editing any file in `data/`, regenerate `questions.js`:
```bash
python3 scripts/compile_db.py
```

### Deploy to production
```bash
npx vercel --prod
```

### Run tests
```bash
node tests/test_ui.js
```

## Technology Stack

- **HTML / Vanilla CSS / Vanilla JS** — No framework dependencies
- **Tailwind CSS** (CDN, preflight disabled) — Utility classes in the Spark Guide section
- **Chart.js** (CDN) — Charts in the Spark Guide
- **MathJax** (CDN) — LaTeX equation rendering in the Spark Guide
- **Puppeteer** (dev dependency) — UI tests

## Adding Questions

See [`scripts/README.md`](scripts/README.md) for the full guide on adding new questions to the database.
