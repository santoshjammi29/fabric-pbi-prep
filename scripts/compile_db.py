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

# Resolve paths relative to this script's location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "questions.js")

# Source JSON files (in load order — order affects the questions.js array order)
FILES = [
    "fabric_part1.json",
    "fabric_part2.json",
    "pbi_part1.json",
    "pbi_part2.json",
    "adf_part1.json",
    "adf_part2.json",
    "sql_part1.json",
    "sql_part2.json",
    "datalake_part1.json",
    "datalake_part2.json",
    "spark_part1.json",
    "spark_part2.json",
]

all_questions = []

for f_name in FILES:
    path = os.path.join(DATA_DIR, f_name)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            all_questions.extend(data)
            print(f"  ✅ Loaded {len(data):>4} questions from {f_name}")
    else:
        print(f"  ⚠️  File not found: {f_name} (skipping)")

print(f"\nTotal: {len(all_questions)} questions compiled")

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write("window.QUESTIONS_DB = ")
    json.dump(all_questions, f, indent=2, ensure_ascii=False)
    f.write(";\n")

print(f"✅ Written to: {OUTPUT_PATH}")
