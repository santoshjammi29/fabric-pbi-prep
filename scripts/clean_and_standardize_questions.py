# scripts/clean_and_standardize_questions.py
"""
Comprehensive Audit & Standardization Script for questions.json
Implements:
1. Semantic Deduplication (32 Master Clusters merged, eliminating redundant copies)
2. Schema Standardization (UnifiedQuestion interface, canonical 8 domains, clean subdomains)
3. Difficulty Re-calibration (V-Order -> HARD, Zero-Trust -> HARD/ARCHITECT, CAP theorem -> HARD/ARCHITECT)
4. Integrity Check & Fluff Elimination (Replacing 240 boilerplate items with bespoke expert answers)
5. Exports cleaned questions, master questions array, and old-to-new ID mapping
"""

import os
import sys
import json
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATCHES_DIR = os.path.join(BASE_DIR, "scripts", "data_patches")
sys.path.insert(0, PATCHES_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "scripts"))

from fix_semantic_duplicates_32 import get_semantic_duplicate_fixes

def get_standardized_domain(item: dict) -> str:
    cat = (item.get("categoryLabel") or item.get("category") or "").upper().strip()
    
    # 1. Compute & Orchestration
    if any(k in cat for k in ["SPARK", "DATABRICKS", "AIRFLOW", "FLINK", "BIG DATA", "DISTRIBUTED", "RESOURCE", "DAG"]):
        return "Compute & Orchestration"
        
    # 2. Databases, SQL & Storage
    if any(k in cat for k in ["SQL", "DATABASE", "QUERY", "JOINS", "AGGREGATION", "DML", "DDL", "PROGRAMMABILITY"]):
        return "Databases, SQL & Storage"
        
    # 3. Data Pipelines & Ingestion
    if any(k in cat for k in ["ADF", "PIPELINE", "INGESTION", "CDC", "KAFKA", "DBT", "ETL", "INTEGRATION"]):
        return "Data Pipelines & Ingestion"
        
    # 4. Data Lakehouse & Architecture
    if any(k in cat for k in ["LAKEHOUSE", "DATALAKE", "DELTA", "MODELING", "VAULT", "STORAGE", "ARCHITECTURE", "MEDALLION", "FORMAT", "CLOUD_DATA"]):
        return "Data Lakehouse & Architecture"
        
    # 5. Data Governance & Quality
    if any(k in cat for k in ["GOVERNANCE", "QUALITY", "SECURITY", "DEVOPS", "METADATA", "CATALOG", "TOPOGRAPHY", "LINEAGE"]):
        return "Data Governance & Quality"
        
    # 6. Analytics, BI & AI
    if any(k in cat for k in ["FABRIC", "POWER BI", "VISUALIZATION", "EXCEL", "ANALYTICS", "RAG", "VECTOR", "LLM", "SEMANTIC"]):
        return "Analytics, BI & AI"
        
    # 7. FinOps & Performance Optimization
    if any(k in cat for k in ["FINOPS", "COST", "PERFORMANCE", "OPTIMIZATION", "TUNING", "DEBUG"]):
        return "FinOps & Performance Optimization"
        
    return "General Data Engineering"

def load_all_patches():
    patches = {}
    patch_modules = [
        ("fix_questions_rag", "get_rag_fixes"),
        ("fix_questions_vector_db", "get_vector_db_fixes"),
        ("fix_questions_llm_frameworks", "get_llm_frameworks_fixes"),
        ("fix_questions_flink", "get_flink_fixes"),
        ("fix_questions_spark_pyspark", "get_spark_pyspark_fixes"),
        ("fix_questions_cloud_data", "get_cloud_data_fixes"),
        ("fix_questions_cdc", "get_cdc_fixes"),
        ("fix_questions_ingestion", "get_ingestion_fixes"),
    ]
    
    for mod_name, func_name in patch_modules:
        try:
            mod = __import__(mod_name)
            func = getattr(mod, func_name)
            data = func()
            patches.update(data)
            print(f"Loaded {len(data)} patches from {mod_name}")
        except Exception as e:
            print(f"Error loading {mod_name}: {e}")
            raise e
            
    return patches

def run_audit_and_cleanup(save_changes: bool = True):
    questions_file = os.path.join(BASE_DIR, "src", "data", "json", "questions.json")
    with open(questions_file, "r", encoding="utf-8") as f:
        questions = json.load(f)
        
    print(f"=== INITIAL STATE: {len(questions)} questions loaded ===")

    # 1. Semantic Deduplication (32 Clusters)
    semantic_fixes = get_semantic_duplicate_fixes()
    print(f"Applying {len(semantic_fixes)} Semantic Duplicate Master Clusters...")
    
    # Collect all IDs to drop and mapping
    ids_to_drop = set()
    id_mapping = {} # old_id -> master_id
    cluster_mapping_details = []
    
    for master_id, fix_info in semantic_fixes.items():
        merged_ids = fix_info["merged_from"]
        for old_id in merged_ids:
            id_mapping[old_id] = master_id
            if old_id != master_id:
                ids_to_drop.add(old_id)
        cluster_mapping_details.append({
            "master_id": master_id,
            "master_question": fix_info["item"]["question"],
            "merged_from": merged_ids,
            "difficulty": fix_info["item"]["difficulty"],
            "domain": fix_info["item"]["domain"],
            "subdomain": fix_info["item"]["subdomain"]
        })

    print(f"Identified {len(ids_to_drop)} redundant duplicate questions to be merged and removed.")

    # 2. Load bespoke patches for boilerplate eradication
    bespoke_patches = load_all_patches()
    print(f"Total bespoke replacement answers ready: {len(bespoke_patches)}")

    # 3. Process every question
    cleaned_questions = []
    dropped_count = 0
    upgraded_vorder = []
    upgraded_zero_trust = []
    upgraded_cap = []
    replaced_boilerplate = 0
    master_questions_list = []
    
    seen_ids = set()

    for q in questions:
        qid = q["id"]
        
        # Skip redundant items that are merged into a Master Question
        if qid in ids_to_drop:
            dropped_count += 1
            continue
            
        # Check if this item is a Master Question
        if qid in semantic_fixes:
            item = dict(semantic_fixes[qid]["item"])
            master_questions_list.append(item)
        else:
            item = dict(q)
            
        # Check if this item has a bespoke answer replacement (fixing boilerplate)
        if qid in bespoke_patches:
            patch = bespoke_patches[qid]
            if "question" in patch:
                item["question"] = patch["question"]
            item["answer"] = patch["answer"]
            replaced_boilerplate += 1

        # 4. Difficulty Re-calibration
        q_text = (item.get("question", "") + " " + item.get("answer", "")).lower()
        curr_diff = item.get("difficulty", "MEDIUM")
        
        # V-Order serialization -> MUST be HARD or ARCHITECT
        if re.search(r'\bv-?order\b', q_text):
            if curr_diff in ["EASY", "MEDIUM"]:
                item["difficulty"] = "HARD"
                upgraded_vorder.append((qid, curr_diff, "HARD", item["question"][:70]))
                
        # Zero-Trust -> MUST be HARD or ARCHITECT
        if "zero-trust" in q_text or "zero trust" in q_text:
            if curr_diff in ["EASY", "MEDIUM"]:
                new_diff = "ARCHITECT" if any(k in q_text for k in ["exabyte", "multi-tenant", "architecture for microsoft fabric"]) else "HARD"
                item["difficulty"] = new_diff
                upgraded_zero_trust.append((qid, curr_diff, new_diff, item["question"][:70]))
                
        # CAP theorem / 2-phase commit / split-brain / distributed consensus
        if any(k in q_text for k in ["cap theorem", "two-phase commit", "2-phase commit", "split-brain", "distributed consensus", "msdtc"]):
            if curr_diff in ["EASY", "MEDIUM"]:
                new_diff = "ARCHITECT" if any(k in q_text for k in ["schema split-brain", "multi-cloud", "disaster recovery"]) else "HARD"
                item["difficulty"] = new_diff
                upgraded_cap.append((qid, curr_diff, new_diff, item["question"][:70]))

        # 5. Schema Standardization to UnifiedQuestion
        std_domain = get_standardized_domain(item)
        item["domain"] = std_domain
        
        # Ensure subdomain is populated
        if not item.get("subdomain"):
            item["subdomain"] = item.get("niche") or f"{item.get('category')} Architecture"
            
        # Ensure category and source fields
        item["category"] = item.get("category", "").strip()
        item["source"] = item.get("source") or "Core Architect"
        item["niche"] = item.get("niche") or item["subdomain"]
        
        # Ensure unique IDs
        if item["id"] in seen_ids:
            print(f"WARNING: Duplicate ID detected: {item['id']}")
            continue
        seen_ids.add(item["id"])
        
        cleaned_questions.append(item)

    print("\n=== AUDIT SUMMARY ===")
    print(f"Original Count: {len(questions)}")
    print(f"Redundant Duplicates Dropped: {dropped_count}")
    print(f"Final Cleaned Count: {len(cleaned_questions)}")
    print(f"Master Questions Created: {len(master_questions_list)}")
    print(f"Bespoke Fluff Replacements Applied: {replaced_boilerplate}")
    print(f"Difficulty Upgrades:")
    print(f"  - V-Order Serialization: {len(upgraded_vorder)}")
    print(f"  - Zero-Trust Architecture: {len(upgraded_zero_trust)}")
    print(f"  - CAP Theorem / Distributed Consistency: {len(upgraded_cap)}")

    # Integrity Assertions
    fluff_hits = [q["id"] for q in cleaned_questions if "execute_platform_operation" in q.get("answer", "") or "requires managing the trade-offs of modern data platform architecture" in q.get("answer", "")]
    print(f"Remaining Fluff Hits: {len(fluff_hits)}")
    assert len(fluff_hits) == 0, f"Found remaining fluff in {fluff_hits}"
    assert len(cleaned_questions) == len(questions) - dropped_count, "Count calculation mismatch!"
    assert len(master_questions_list) == len(semantic_fixes), "Master questions count mismatch!"

    if save_changes:
        # Save main questions.json
        with open(questions_file, "w", encoding="utf-8") as f:
            json.dump(cleaned_questions, f, indent=2, ensure_ascii=False)
        print(f"Successfully saved {len(cleaned_questions)} questions to {questions_file}")
        
        # Save questions_unified_cleaned.json export
        unified_export_file = os.path.join(BASE_DIR, "src", "data", "json", "questions_unified_cleaned.json")
        with open(unified_export_file, "w", encoding="utf-8") as f:
            json.dump(cleaned_questions, f, indent=2, ensure_ascii=False)
        print(f"Successfully exported {len(cleaned_questions)} questions to {unified_export_file}")

        # Save scratch artifacts for user inspection
        scratch_dir = "/Users/santosh/.gemini/antigravity/brain/883a715c-c6cf-46ca-a82f-df83398173e7/scratch"
        with open(os.path.join(scratch_dir, "master_questions_cleaned.json"), "w", encoding="utf-8") as f:
            json.dump(master_questions_list, f, indent=2, ensure_ascii=False)
        with open(os.path.join(scratch_dir, "cluster_mapping_details.json"), "w", encoding="utf-8") as f:
            json.dump(cluster_mapping_details, f, indent=2, ensure_ascii=False)
        with open(os.path.join(scratch_dir, "id_mapping_32.json"), "w", encoding="utf-8") as f:
            json.dump(id_mapping, f, indent=2, ensure_ascii=False)
        print("Successfully saved scratch inspection files.")

    return {
        "original_count": len(questions),
        "final_count": len(cleaned_questions),
        "dropped_count": dropped_count,
        "master_questions_count": len(master_questions_list),
        "master_questions": master_questions_list,
        "cluster_mapping": cluster_mapping_details,
        "upgraded_vorder": upgraded_vorder,
        "upgraded_zero_trust": upgraded_zero_trust,
        "upgraded_cap": upgraded_cap,
        "replaced_boilerplate": replaced_boilerplate
    }

if __name__ == "__main__":
    run_audit_and_cleanup(save_changes=True)
