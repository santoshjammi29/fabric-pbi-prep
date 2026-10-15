# scripts/gen_spark_databricks_curriculum.py
import json
import sys
from curriculum_databricks import DATABRICKS_ITEMS
from curriculum_spark import SPARK_ITEMS
from curriculum_scenarios import SCENARIO_ITEMS

DE_FILE = 'src/data/json/data_de.json'
ARCH_FILE = 'src/data/json/data_architecture.json'

def main():
    all_curriculum = DATABRICKS_ITEMS + SPARK_ITEMS + SCENARIO_ITEMS
    print(f"Total curriculum items defined: {len(all_curriculum)}")

    # 1. Update data_de.json
    with open(DE_FILE, 'r') as f:
        de_data = json.load(f)
    print(f"data_de.json before: {len(de_data)}")
    existing_de_ids = {d['id'] for d in de_data}

    de_added = 0
    de_skipped = 0
    for item in all_curriculum:
        de_id = item['de_id']
        if de_id in existing_de_ids:
            print(f"[data_de] SKIP duplicate: {de_id}")
            de_skipped += 1
            continue
        
        de_entry = {
            "id": de_id,
            "source": "Modern Stack Mastery",
            "category": item["category_de"],
            "niche": item["niche"],
            "difficulty": item["difficulty"],
            "question": item["question"],
            "answer": item["answer"],
            "domain": item.get("domain", "Data Lakehouse & Architecture"),
            "subdomain": item.get("subdomain", "Databricks Compute & Governance")
        }
        existing_de_ids.add(de_id)
        de_data.append(de_entry)
        de_added += 1

    with open(DE_FILE, 'w') as f:
        json.dump(de_data, f, indent=2, ensure_ascii=False)
    print(f"data_de.json after: {len(de_data)} (Added: {de_added}, Skipped: {de_skipped})")

    # 2. Update data_architecture.json
    with open(ARCH_FILE, 'r') as f:
        arch_data = json.load(f)
    print(f"data_architecture.json before: {len(arch_data)}")
    existing_arch_ids = {d['id'] for d in arch_data}

    arch_added = 0
    arch_skipped = 0
    for item in all_curriculum:
        arch_id = item['arch_id']
        if arch_id in existing_arch_ids:
            print(f"[data_architecture] SKIP duplicate: {arch_id}")
            arch_skipped += 1
            continue
        
        arch_entry = {
            "id": arch_id,
            "source": "Architecture Hub",
            "category": item["category_arch"],
            "niche": item["niche"],
            "difficulty": item["difficulty"],
            "question": item["question"],
            "answer": item["answer"]
        }
        existing_arch_ids.add(arch_id)
        arch_data.append(arch_entry)
        arch_added += 1

    with open(ARCH_FILE, 'w') as f:
        json.dump(arch_data, f, indent=2, ensure_ascii=False)
    print(f"data_architecture.json after: {len(arch_data)} (Added: {arch_added}, Skipped: {arch_skipped})")

if __name__ == '__main__':
    main()
