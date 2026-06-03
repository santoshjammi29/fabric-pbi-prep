"""
compile_db.py — Question Database Builder
==========================================
Merges all source JSON question files from ../data/ into ../questions.js

Usage (run from project root or scripts/ directory):
    python3 scripts/compile_db.py
    cd scripts && python3 compile_db.py

Add new question files by placing them in ../data/ and adding the filename
to the FILES list below, then re-run this script.
"""

import json
import os

import glob

# Resolve paths relative to this script's location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "questions.js")

all_questions = []
seen_ids = set()

# Load all JSON files in the data directory dynamically
pattern = os.path.join(DATA_DIR, "*.json")
json_files = sorted(glob.glob(pattern))

for path in json_files:
    f_name = os.path.basename(path)
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        file_added = 0
        for q in data:
            q_id = q.get("id")
            if q_id not in seen_ids:
                all_questions.append(q)
                seen_ids.add(q_id)
                file_added += 1
                
        print(f"  ✅ Loaded {file_added:>4} new questions from {f_name} (Total file items: {len(data)})")
    except Exception as e:
        print(f"  ❌ Error loading {f_name}: {e}")

print(f"\nTotal: {len(all_questions)} unique questions compiled")

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write("window.QUESTIONS_DB = ")
    json.dump(all_questions, f, indent=2, ensure_ascii=False)
    f.write(";\n")

print(f"✅ Written to: {OUTPUT_PATH}")
