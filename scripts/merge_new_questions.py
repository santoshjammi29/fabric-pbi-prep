#!/usr/bin/env python3
"""
Merges all new question JSON files from scripts/ into questions.js.
Usage: python3 scripts/merge_new_questions.py
"""

import json
import os
import glob
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUESTIONS_JS = os.path.join(BASE_DIR, "questions.js")
SCRIPTS_DIR = os.path.join(BASE_DIR, "scripts")

def load_existing():
    """Load current questions.js and return the array."""
    with open(QUESTIONS_JS, "r", encoding="utf-8") as f:
        content = f.read()
    # Strip the window.QUESTIONS_DB = ... wrapper
    content = content.strip()
    content = re.sub(r'^window\.QUESTIONS_DB\s*=\s*', '', content)
    content = content.rstrip(';').strip()
    return json.loads(content)

def load_new_files():
    """Load all new_q_*.json files from scripts/."""
    pattern = os.path.join(SCRIPTS_DIR, "new_q_*.json")
    files = sorted(glob.glob(pattern))
    all_new = []
    for f in files:
        print(f"  Loading: {os.path.basename(f)}")
        try:
            with open(f, "r", encoding="utf-8") as fp:
                data = json.load(fp)
            if isinstance(data, list):
                all_new.extend(data)
                print(f"    -> {len(data)} questions")
            else:
                print(f"    -> ERROR: not a JSON array")
        except Exception as e:
            print(f"    -> ERROR: {e}")
    return all_new

def validate_question(q, seen_ids):
    """Basic validation of a question dict."""
    required = ["id", "category", "niche", "question", "answer", "difficulty"]
    for field in required:
        if field not in q or not q[field]:
            return False, f"Missing field: {field}"
    if q["difficulty"] not in ("EASY", "MEDIUM", "HARD"):
        return False, f"Invalid difficulty: {q['difficulty']}"
    if q["id"] in seen_ids:
        return False, f"Duplicate id: {q['id']}"
    return True, "ok"

def merge():
    print("Loading existing questions...")
    existing = load_existing()
    existing_ids = {q["id"] for q in existing}
    print(f"  -> {len(existing)} existing questions, {len(existing_ids)} unique IDs")

    print("\nLoading new question files...")
    new_qs = load_new_files()
    print(f"\n  -> {len(new_qs)} new questions loaded from files")

    # Validate and deduplicate
    valid_new = []
    all_ids = set(existing_ids)
    skipped = 0
    for q in new_qs:
        ok, reason = validate_question(q, all_ids)
        if ok:
            valid_new.append(q)
            all_ids.add(q["id"])
        else:
            skipped += 1

    print(f"  -> {len(valid_new)} valid new questions ({skipped} skipped as duplicate/invalid)")

    merged = existing + valid_new
    print(f"\nMerged total: {len(merged)} questions")

    # Write back
    js_content = "window.QUESTIONS_DB = " + json.dumps(merged, indent=2, ensure_ascii=False) + ";"
    with open(QUESTIONS_JS, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"Written to questions.js ({len(js_content):,} bytes)")

    # Print summary
    cats = {}
    for q in merged:
        k = q["category"] + "::" + q["niche"]
        if k not in cats:
            cats[k] = {"EASY": 0, "MEDIUM": 0, "HARD": 0}
        cats[k][q["difficulty"]] += 1

    print("\n=== FINAL SUMMARY ===")
    grand = 0
    for k, v in sorted(cats.items()):
        cat, niche = k.split("::", 1)
        total = v["EASY"] + v["MEDIUM"] + v["HARD"]
        grand += total
        flag = "✅" if v["EASY"] >= 40 and v["MEDIUM"] >= 40 and v["HARD"] >= 40 else "🔄"
        print(f"{flag} [{cat}] {niche[:55]}: E{v['EASY']}/M{v['MEDIUM']}/H{v['HARD']} = {total}")
    print(f"\nGRAND TOTAL: {grand} questions")

if __name__ == "__main__":
    merge()
