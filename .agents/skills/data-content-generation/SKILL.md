---
name: data-content-generation
description: |
  Skill for bulk generating and appending structured JSON data entries to knowledge base files.
  Activate when:
  - Adding 50+ new entries to a JSON data array
  - Generating Q&As, concepts, architecture scenarios, company profiles, Databricks 100 days, or code examples in bulk
  - Appending to existing data files without corrupting them
  - Validating schema constraints, unique kebab-case IDs, and JSON syntax integrity
  - Running parallel data generation scripts across multiple files

  DO NOT trigger for:
  - Adding fewer than 10 entries (do it inline)
  - Schema design (use a data modeling skill instead)
---

# Bulk Data Content Generation Skill

Use this skill when generating and appending large numbers of structured data entries (50+) to JSON knowledge base files across data platforms, interview prep portals, and architecture repositories.

---

## 1. Core Principle: Write Python Scripts, Not Direct Model Outputs

**Never** attempt to dump 200+ complex JSON entries in a raw text response or ask a subagent to print raw JSON — tool output truncation, escaping errors, and network limits will corrupt the payload.

**Always** write and execute a self-contained Python script via `run_command` that:
1. Defines structured entries as native Python dictionaries.
2. Loads the target JSON file from `src/data/json/`.
3. Performs an $O(N)$ duplicate ID check against existing entries.
4. Appends the new entries.
5. Writes the file atomically with UTF-8 encoding and clean 2-space indentation.
6. Asserts valid JSON parsing and reports before/after counts.

---

## 2. Safe Append Script Pattern

```python
import json
import os

FILE = 'src/data/json/data_concepts.json'

# Step 1: Load existing dataset
with open(FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

before_count = len(data)
print(f"Existing count: {before_count}")

# Step 2: Validate ID uniqueness
existing_ids = {item['id'] for item in data}

new_entries = [
    {
        "id": "delta-lake-liquid-clustering-internals",
        "term": "Delta Lake Liquid Clustering Internals",
        "category": "DATABRICKS",
        "difficulty": "ARCHITECT",
        "definition": "Liquid clustering is a flexible data layout technique that replaces legacy Hive-style physical partitioning and Z-ordering with dynamic Hilbert curve clustering.",
        "explanation": "Liquid clustering decouples physical directory layout from query clustering keys. It allows clustering keys to be redefined dynamically without rewriting existing data, avoiding file fragmentation and partition skew.",
        "keyPoints": [
            "Dynamically clusters data based on CLUSTER BY keys without static directory hierarchies.",
            "Eliminates partition skew and the small file problem caused by high-cardinality partitions.",
            "Allows redefining clustering columns instantly without requiring costly full table rewrites.",
            "Integrated with Databricks Predictive I/O for intelligent file pruning."
        ]
    }
]

for item in new_entries:
    assert item['id'] not in existing_ids, f"Duplicate ID detected: {item['id']}"
    assert item['term'].strip(), "Term cannot be empty"
    assert len(item['keyPoints']) >= 3, f"Need at least 3 keyPoints for {item['id']}"

# Step 3: Append and write atomically
data.extend(new_entries)

temp_file = FILE + '.tmp'
with open(temp_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

os.replace(temp_file, FILE)

# Step 4: Verify reload
with open(FILE, 'r', encoding='utf-8') as f:
    verified_data = json.load(f)

print(f"Successfully updated! New count: {len(verified_data)} (+{len(new_entries)})")
```

---

## 3. Supported Target Schemas

### Concept (`src/data/json/data_concepts.json`)
```python
{
    "id": "unique-kebab-slug",
    "term": "Official Concept Title",
    "category": "FABRIC | DATABRICKS | APACHE AIRFLOW | SPARK & DATABRICKS | DBT | SQL SERVER",
    "difficulty": "EASY | MEDIUM | HARD | ARCHITECT",
    "definition": "1-2 sentence concise definition explaining what it is.",
    "explanation": "3-5 sentences of deep technical explanation covering architecture, tradeoffs, and production behavior.",
    "keyPoints": [
        "Key technical fact 1 with specific mechanisms.",
        "Key technical fact 2 with configuration or performance implications.",
        "Key technical fact 3 comparing against alternative patterns.",
        "Key technical fact 4 with production guardrail or SLA metric."
    ]
}
```

### Question (`src/data/json/questions.json` & `data_de.json`)
```python
{
    "id": "airflow-q-089",
    "source": "Production Engineering Drills",
    "category": "AIRFLOW",
    "niche": "Scheduler Optimization & HA",
    "difficulty": "HARD",
    "question": "How do you eliminate scheduler heartbeat timeouts in high-frequency multi-DAG environments?",
    "answer": "Detailed 2-3 paragraph answer explaining root cause (GIL contention, DB connection exhaustion), remediation settings (scheduler.heartbeat_sec, min_file_process_interval), and Celery/Kubernetes executor tuning.",
    "domain": "Compute & Orchestration",
    "subdomain": "Airflow Scheduler"
}
```

### Architecture Scenario (`src/data/json/data_architecture.json`)
```python
{
    "id": "arch-fabric-045",
    "source": "Enterprise Lakehouse Migration",
    "category": "Microsoft Fabric Architecture",
    "niche": "Direct Lake Memory Guardrails",
    "difficulty": "ARCHITECT",
    "question": "How do you architect Direct Lake semantic models to guarantee they never fall back to DirectQuery under F64 capacity constraints?",
    "answer": "Comprehensive architectural solution detailing VertiPaq memory paging limits (25 GB on F64), V-Order Parquet compaction schedules, surrogate key data type optimization (integer over string UUIDs), and framed refresh isolation."
}
```

### Company Profile (`src/data/json/company_profiles.json`)
```python
{
    "id": "company-microsoft-gcc",
    "company": "Microsoft Global Delivery",
    "tier": "TIER_1_GCC",
    "category": "Cloud & Enterprise Tech",
    "location": "Hyderabad / Bangalore",
    "techStack": ["Azure Data Factory", "Microsoft Fabric", "Azure Synapse", "OneLake", "Purview", "Databricks"],
    "hiringBar": "Deep focus on distributed systems fundamentals, ACID transactional lakehouse internals, and Fabric Direct Lake memory management.",
    "interviewRounds": [
        "Round 1: Screening & Core Spark / Distributed Data Structures",
        "Round 2: End-to-End System Design (Medallion Lakehouse & Fabric Capacity)",
        "Round 3: Live Debugging & PySpark Optimization Scenario",
        "Round 4: Director Behavioral & Cloud FinOps Governance"
    ],
    "keyQuestions": [
        "Explain VertiPaq framing mechanics vs Import full processing.",
        "How do OneLake Shortcuts handle cross-region egress costs?"
    ]
}
```

### Databricks 100 Day Challenge (`src/data/json/databricks_100.json`)
```python
{
    "id": "databricks-day-045",
    "day": 45,
    "term": "Photon Engine C++ Vectorized Execution",
    "category": "Compute & Engine",
    "difficulty": "HARD",
    "whatYouShouldKnow": [
        "Photon is a native C++ vectorized execution engine that replaces Spark's JVM Catalyst execution for physical operators.",
        "Accelerates string processing, regular expressions, and hash aggregations by 2-5x.",
        "Executes directly on columnar Parquet data without JVM garbage collection overhead."
    ],
    "productionCodeSnippet": "# Enable Photon on Databricks Runtime 13.0+\n# Configured via cluster runtime UI or JSON specification:\n# spark_version: '13.3.x-photon-scala2.12'",
    "certificationMapping": [
        "Databricks Certified Associate Developer for Apache Spark",
        "Databricks Certified Data Engineer Professional"
    ]
}
```

---

## 4. Bulk Generation Workflow & Safety Checklist

- [ ] **Batch Size**: 50–150 entries per script execution.
- [ ] **ID Format**: strictly lowercase kebab-case (e.g., `fabric-purview-lineage-01`).
- [ ] **Enums**: Check difficulty matches exact uppercase values (`EASY`, `MEDIUM`, `HARD`, `ARCHITECT`).
- [ ] **No Placeholders**: Never use `TODO`, `TBD`, or lorem ipsum text in answers or explanations.
- [ ] **Encoding**: Always open with `encoding='utf-8'` and write with `ensure_ascii=False`.
- [ ] **Automated Test Run**: Run `npm test -- --run` immediately after modifying datasets to verify no broken routes or invalid schemas.
