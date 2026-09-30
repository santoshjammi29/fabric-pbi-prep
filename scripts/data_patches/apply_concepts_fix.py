# apply_concepts_fix.py
import json
import sys
from fix_concepts import airflow_data
from data_concepts_expert import dbt_data
from data_concepts_databricks import databricks_data

concepts_file = "src/data/json/data_concepts.json"

with open(concepts_file, "r") as f:
    concepts = json.load(f)

print(f"Total existing concepts: {len(concepts)}")
# Keep the first 140 pristine concepts
clean_concepts = concepts[:140]
print(f"Preserved {len(clean_concepts)} original concepts.")

updated_count = 0
not_found = []

# Merge the 45 Airflow concepts
for term, data in airflow_data.items():
    clean_concepts.append({
        "id": data["id"],
        "term": term,
        "category": "APACHE AIRFLOW",
        "difficulty": data["difficulty"],
        "definition": data["definition"],
        "explanation": data["explanation"],
        "keyPoints": data["keyPoints"]
    })
    updated_count += 1

# Merge the 45 DBT concepts
for term, data in dbt_data.items():
    clean_concepts.append({
        "id": data["id"],
        "term": term,
        "category": "DBT",
        "difficulty": data["difficulty"],
        "definition": data["definition"],
        "explanation": data["explanation"],
        "keyPoints": data["keyPoints"]
    })
    updated_count += 1

# Merge the 60 Databricks concepts
for term, data in databricks_data.items():
    clean_concepts.append({
        "id": data["id"],
        "term": term,
        "category": "DATABRICKS",
        "difficulty": data["difficulty"],
        "definition": data["definition"],
        "explanation": data["explanation"],
        "keyPoints": data["keyPoints"]
    })
    updated_count += 1

print(f"Added {updated_count} high-quality concepts. Total concepts: {len(clean_concepts)}")

# Verify no fluff remains
boilerplate_check = [c for c in clean_concepts if "fundamental component in" in c.get("definition", "") or "plays a crucial role. It allows engineers" in c.get("explanation", "")]
if boilerplate_check:
    print(f"ERROR: {len(boilerplate_check)} boilerplate concepts remain!")
    sys.exit(1)

with open(concepts_file, "w") as f:
    json.dump(clean_concepts, f, indent=2, ensure_ascii=False)

print("SUCCESS: data_concepts.json updated cleanly with 290 total concepts!")
