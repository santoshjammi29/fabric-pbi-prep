# apply_arch_fix.py
import json
import arch_airflow_data
import arch_dbt_data
import arch_databricks_data

def apply_architecture_updates():
    arch_file = "src/data/json/data_architecture.json"
    with open(arch_file, "r", encoding="utf-8") as f:
        existing = json.load(f)

    print(f"Loaded {len(existing)} existing architecture scenarios.")

    airflow_scenarios = arch_airflow_data.get_airflow_scenarios()
    dbt_scenarios = arch_dbt_data.get_dbt_scenarios()
    databricks_scenarios = arch_databricks_data.get_databricks_scenarios()

    all_updates = {}
    for item in airflow_scenarios + dbt_scenarios + databricks_scenarios:
        all_updates[item["id"]] = item

    print(f"Total updated expert scenarios to apply: {len(all_updates)}")

    updated_count = 0
    new_scenarios = []
    for item in existing:
        item_id = item.get("id")
        if item_id in all_updates:
            new_scenarios.append(all_updates[item_id])
            updated_count += 1
        else:
            new_scenarios.append(item)

    print(f"Successfully matched and replaced {updated_count} scenarios.")
    assert updated_count == 120, f"Expected 120 updates, got {updated_count}"
    assert len(new_scenarios) == len(existing), f"Length mismatch: {len(new_scenarios)} vs {len(existing)}"

    # Audit check on the updated items
    boilerplate_hits = 0
    for s in new_scenarios:
        ans = s.get("answer", "")
        if "def run_architect_task(): pass" in ans:
            boilerplate_hits += 1
        if "scenario involves designing a robust solution" in ans:
            boilerplate_hits += 1

    print(f"Boilerplate hits remaining in entire architecture dataset: {boilerplate_hits}")
    assert boilerplate_hits == 0, f"Found {boilerplate_hits} boilerplate remnants!"

    with open(arch_file, "w", encoding="utf-8") as f:
        json.dump(new_scenarios, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(new_scenarios)} architecture scenarios to {arch_file}")

if __name__ == "__main__":
    apply_architecture_updates()
