"""
Build and validate src/data/json/company_profiles.json
Combines:
- 52 Tier 1 FAANG & BigTech companies
- 52 Tier 1 Global FinTech companies
- 52 Global Capability Centers (GCCs)
Total: 156 comprehensive company profiles (>50 per tier).
"""

import json
import os
from scripts.data_companies_bigtech import BIGTECH_PROFILES
from scripts.data_companies_fintech import FINTECH_PROFILES
from scripts.data_companies_gcc import GCC_PROFILES

OUTPUT_PATH = "src/data/json/company_profiles.json"

def main():
    all_profiles = []
    all_profiles.extend(BIGTECH_PROFILES)
    all_profiles.extend(FINTECH_PROFILES)
    all_profiles.extend(GCC_PROFILES)

    # 1. Validation: check uniqueness of IDs
    seen_ids = set()
    duplicates = []
    for comp in all_profiles:
        cid = comp.get("id")
        if not cid:
            raise ValueError(f"Missing ID for company: {comp.get('name')}")
        if cid in seen_ids:
            duplicates.append(cid)
        seen_ids.add(cid)

    if duplicates:
        raise ValueError(f"Duplicate IDs detected: {duplicates}")

    # 2. Check counts by tier
    tier_counts = {}
    for comp in all_profiles:
        tier = comp.get("tier")
        tier_counts[tier] = tier_counts.get(tier, 0) + 1

    print("Tier Breakdown:")
    for tier, count in tier_counts.items():
        print(f"  - {tier}: {count} companies")
        assert count >= 50, f"Tier '{tier}' has only {count} companies, which is less than 50!"

    print(f"Total Profiles to Write: {len(all_profiles)}")

    # 3. Ensure destination directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    # 4. Write to JSON
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_profiles, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated {OUTPUT_PATH} with {len(all_profiles)} company profiles!")

if __name__ == "__main__":
    main()
