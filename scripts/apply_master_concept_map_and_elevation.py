# scripts/apply_master_concept_map_and_elevation.py
"""
Unified Orchestrator:
1. Replaces template boilerplate in Airflow 001-075 and dbt 001-075 with deep technical answers.
2. Elevates all 79 existing ARCHITECT questions with full multi-modality (Theory, Blueprint, Implementation, Trade-off, Failure, Cost).
3. Appends 24 new extreme edge-case ARCHITECT questions across 8 domains (total 103 ARCHITECT questions).
4. Re-calibrates difficulty: Zero-Trust, V-Order, CAP Theorem questions upgraded to HARD.
5. Builds and applies the Master Concept Map: Assigns valid linked_concept_id to all 2,930 questions.
6. Validates 100% integrity and saves src/data/json/questions.json.
"""

import json
import re
import sys
from collections import Counter

sys.path.append("scripts")
sys.path.append("scripts/data_patches")

from patch_airflow_1_to_35 import get_airflow_1_to_35
from patch_airflow_36_to_75 import get_airflow_36_to_75
from patch_dbt_1_to_35 import get_dbt_1_to_35
from patch_dbt_36_to_75 import get_dbt_36_to_75
from patch_architect_core import get_architect_core_fixes
from patch_architect_airflow import get_architect_airflow_fixes
from patch_architect_dbt import get_architect_dbt_fixes
from patch_architect_databricks import get_architect_databricks_fixes
from extreme_edge_cases_data import get_extreme_edge_case_questions

def clean_tokens(text):
    return set(re.findall(r'[a-zA-Z0-9_\-]+', text.lower()))

def main():
    print("=== Step 1: Loading Data ===")
    with open("src/data/json/questions.json", "r", encoding="utf-8") as f:
        questions = json.load(f)
    print(f"Loaded {len(questions)} existing questions.")

    with open("src/data/json/data_concepts.json", "r", encoding="utf-8") as f:
        concepts = json.load(f)
    print(f"Loaded {len(concepts)} concepts.")
    concept_map = {c["id"]: c for c in concepts}
    concept_ids = set(concept_map.keys())

    # Build fast term and keyword index for concepts
    term_index = []
    for c in concepts:
        term_clean = re.sub(r'\(.*?\)', '', c['term']).strip().lower()
        terms = [term_clean, c['term'].lower(), c['id'].replace('-', ' ')]
        term_index.append({
            'id': c['id'],
            'term': c['term'],
            'category': c['category'],
            'terms': terms,
            'tokens': clean_tokens(c['term'] + ' ' + c['definition'] + ' ' + ' '.join(c['keyPoints']))
        })

    cat_defaults = {
        'FABRIC': 'fabric-onelake',
        'POWER BI': 'pbi-star-schema',
        'ADF': 'adf-pipeline',
        'SQL SERVER': 'sql-clustered-index',
        'DATALAKE ARCHITECTURE': 'dl-delta-lake',
        'LAKEHOUSE': 'dl-delta-lake',
        'SPARK & DATABRICKS': 'spark-catalyst',
        'SPARK_PYSPARK': 'spark-dataframe',
        'Databricks': 'databricks-delta-lake-databricks',
        'AIRFLOW': 'airflow-dag-directed-acyclic-graph',
        'DAG': 'airflow-dag-directed-acyclic-graph',
        'DBT': 'dbt-dbt-model',
        'CDC': 'de-cdc',
        'INGESTION': 'de-etl-elt',
        'CLOUD_DATA': 'dl-object-storage',
        'KAFKA': 'de-cdc',
        'FLINK': 'spark-rdd',
        'VECTOR_DB': 'fabric-lakehouse',
        'RAG': 'fabric-lakehouse',
        'LLM_FRAMEWORKS': 'fabric-lakehouse',
    }

    def resolve_linked_concept(q):
        # If question already has a valid concept ID from edge cases, keep it
        if q.get('linked_concept_id') in concept_ids:
            return q['linked_concept_id']

        q_cat = q.get('category', '').upper()
        q_text = (q.get('question', '') + ' ' + q.get('niche', '') + ' ' + q.get('subdomain', '')).lower()
        q_tokens = clean_tokens(q_text)

        best_cid = None
        best_score = -1

        for c in term_index:
            score = 0
            cid = c['id']
            c_cat = c['category'].upper()

            # Category alignment bonus
            if (q_cat in c_cat) or (c_cat in q_cat) or (q_cat == 'AIRFLOW' and 'AIRFLOW' in c_cat) or (q_cat == 'DBT' and 'DBT' in c_cat):
                score += 15
            elif q_cat in ['SPARK & DATABRICKS', 'SPARK_PYSPARK', 'Databricks'] and c_cat in ['SPARK & DATABRICKS', 'DATABRICKS']:
                score += 15
            elif q_cat in ['DATALAKE ARCHITECTURE', 'LAKEHOUSE', 'CLOUD_DATA'] and c_cat in ['DATALAKE ARCHITECTURE', 'GENERAL DE']:
                score += 10

            # Exact term match bonus
            for t in c['terms']:
                if len(t) > 3 and t in q_text:
                    score += 50 + len(t)

            # Keyword overlap
            overlap = len(q_tokens & c['tokens'])
            score += overlap * 2

            if score > best_score:
                best_score = score
                best_cid = cid

        if best_score < 10:
            return cat_defaults.get(q_cat, 'de-etl-elt')
        return best_cid

    print("=== Step 2: Merging Patches ===")
    # Aggregate all answer patches
    patches = {}
    patches.update(get_airflow_1_to_35())
    patches.update(get_airflow_36_to_75())
    patches.update(get_dbt_1_to_35())
    patches.update(get_dbt_36_to_75())
    patches.update(get_architect_core_fixes())
    patches.update(get_architect_airflow_fixes())
    patches.update(get_architect_dbt_fixes())
    patches.update(get_architect_databricks_fixes())
    print(f"Total patch answers loaded: {len(patches)}")

    # Apply patches to existing questions
    updated_questions = []
    patch_applied_count = 0
    recalibrated_count = 0

    for q in questions:
        q_copy = dict(q)
        qid = q_copy["id"]

        # 1. Apply Answer Patch if present
        if qid in patches:
            q_copy["answer"] = patches[qid]
            patch_applied_count += 1

        # 2. Difficulty Recalibration
        # Criteria: If a question requires knowledge of Zero-Trust, V-Order serialization, or complex CAP theorem trade-offs, it MUST be tagged as HARD or ARCHITECT
        q_text_all = (q_copy["question"] + " " + q_copy.get("niche", "")).lower()
        if any(term in q_text_all for term in ["zero-trust", "v-order", "cap theorem"]):
            if q_copy.get("difficulty") in ["EASY", "MEDIUM"]:
                q_copy["difficulty"] = "HARD"
                recalibrated_count += 1

        # 3. Assign Master Concept Map ID
        q_copy["linked_concept_id"] = resolve_linked_concept(q_copy)

        updated_questions.append(q_copy)

    print(f"Applied answer patches to {patch_applied_count} questions.")
    print(f"Recalibrated difficulty on {recalibrated_count} questions.")

    print("=== Step 3: Appending 24 Extreme Edge-Case ARCHITECT Questions ===")
    edge_cases = get_extreme_edge_case_questions()
    existing_ids = set(q["id"] for q in updated_questions)

    added_edge_cases = 0
    for eq in edge_cases:
        if eq["id"] not in existing_ids:
            # Ensure concept is valid
            if eq.get("linked_concept_id") not in concept_ids:
                eq["linked_concept_id"] = resolve_linked_concept(eq)
            updated_questions.append(eq)
            existing_ids.add(eq["id"])
            added_edge_cases += 1

    print(f"Added {added_edge_cases} new extreme edge-case questions.")
    print(f"Total questions in database: {len(updated_questions)}")

    print("=== Step 4: Verification and Quality Audits ===")
    # 1. Fluff Check
    fluff_found = []
    for q in updated_questions:
        if "is an essential concept. Understanding this enables scalable data engineering" in q["answer"]:
            fluff_found.append(q["id"])
    print(f"Questions with template fluff: {len(fluff_found)}")
    assert len(fluff_found) == 0, f"Fluff found in {fluff_found}"

    # 2. Concept Map Check
    missing_concepts = [q["id"] for q in updated_questions if q.get("linked_concept_id") not in concept_ids]
    print(f"Questions missing valid linked_concept_id: {len(missing_concepts)}")
    assert len(missing_concepts) == 0, f"Missing concepts in {missing_concepts}"

    # 3. ARCHITECT Section Check
    required_sections = [
        "The Theory",
        "The Blueprint",
        "The Implementation",
        "Trade-off Analysis",
        "Failure Scenario",
        "Cost Impact"
    ]
    arch_qs = [q for q in updated_questions if q.get("difficulty") == "ARCHITECT"]
    print(f"Total ARCHITECT questions: {len(arch_qs)}")
    
    missing_sections_count = 0
    for q in arch_qs:
        ans = q["answer"]
        missing = [sec for sec in required_sections if sec not in ans]
        if missing:
            print(f"ARCHITECT {q['id']} missing sections: {missing}")
            missing_sections_count += 1
    
    print(f"ARCHITECT questions missing required sections: {missing_sections_count}")
    assert missing_sections_count == 0, "Some ARCHITECT questions are missing required sections!"

    # 4. Check Unique IDs
    id_counts = Counter(q["id"] for q in updated_questions)
    dupes = [id for id, cnt in id_counts.items() if cnt > 1]
    print(f"Duplicate IDs: {len(dupes)}")
    assert len(dupes) == 0, f"Duplicate IDs found: {dupes}"

    print("=== Step 5: Saving Dataset ===")
    with open("src/data/json/questions.json", "w", encoding="utf-8") as f:
        json.dump(updated_questions, f, indent=2, ensure_ascii=False)
    print("Successfully saved src/data/json/questions.json!")

if __name__ == "__main__":
    main()
