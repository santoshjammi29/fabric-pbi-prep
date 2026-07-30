# Data Engineering Universe — Interactive Mindmap Guide

This directory hosts the self-contained interactive **Data Engineering Mindmap** available at route `/data-engineering-mindmap`.

## Overview
The Mindmap visualizes 250+ concepts across 10 core data engineering domains using a real-time D3 2D force-directed layout with canvas particle edge streams, soft node pulsing, interactive hover glows, difficulty filters (`[B]eginner`, `[I]ntermediate`, `[A]dvanced`, `[X]Architect`), exploration progress tracking, and detailed concept cards.

---

## 1. How to Add New Nodes

1. Open `build_full_mindmap.py` or edit `data/data_mindmap_taxonomy.json` directly.
2. Inside `raw_taxonomy`, locate your target domain and sub-domain.
3. Append a new concept object under `concepts`:

```python
{
    "name": "Apache Iceberg V3",
    "id": "iceberg-v3",
    "diff": "A", # B = Beginner, I = Intermediate, A = Advanced, X = Architect
    "desc": "Next-gen table format features including deletion vectors and row-level lineage.",
    "why": "Increases write performance and reduces small-file compaction overhead.",
    "kc": [
        "Deletion Vectors",
        "Row-Level Lineage",
        "Puffin File Metadata",
        "Branching & Tagging"
    ],
    "prereqs": ["storage-table-formats-iceberg-tf"],
    "resources": [
        {"label": "Iceberg Spec V3", "url": "https://iceberg.apache.org/spec/"}
    ],
    "siteLinks": [
        {"label": "Lakehouse Architecture", "route": "/lakehouse"}
    ]
}
```

4. Regenerate the dataset and HTML page:
```bash
python3 build_full_mindmap.py
python3 build_html.py
```

---

## 2. How to Change Colors

Domain colors are defined in `DOMAINS` array inside `build_full_mindmap.py` and CSS variables in `data-engineering-mindmap.html`:

```python
DOMAINS = [
    {"id": "foundations", "name": "DATA FOUNDATIONS", "color": "#4f9eff"},
    {"id": "ingestion", "name": "DATA INGESTION", "color": "#00d9ff"},
    {"id": "storage", "name": "DATA STORAGE", "color": "#7c3aed"},
    ...
]
```

To update a color:
1. Change the hexadecimal hex string (e.g., `#00d9ff` to `#00f0ff`).
2. Run `python3 build_full_mindmap.py && python3 build_html.py`.

---

## 3. How to Add a New Domain

1. Add the domain configuration in `DOMAINS`:
```python
{"id": "aiops", "name": "AI & MLOPS", "color": "#ec4899"}
```
2. Add a new key under `raw_taxonomy` in `build_full_mindmap.py`:
```python
"aiops": [
    {
        "name": "Feature Stores", "id": "feature-store", "difficulty": "A",
        "desc": "Centralized repositories for storing and serving ML features.",
        "why": "Prevents train/serve skew and enables feature reuse across models.",
        "concepts": [...]
    }
]
```
3. Re-run `python3 build_full_mindmap.py && python3 build_html.py`.

---

## 4. How to Wire a New Site Route

When creating a new internal route link inside a concept card (e.g. `/mlops-overview`):
1. In your node definition, add an entry under `siteLinks`:
```python
"siteLinks": [
    {"label": "MLOps Overview", "route": "/mlops-overview"}
]
```
2. Clicking this button in the right-panel Concept Card navigates directly to that site route on `fabric-pbi-prep.vercel.app`.
