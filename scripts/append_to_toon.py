#!/usr/bin/env python3
import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
JSON_PATH = os.path.join(PROJECT_ROOT, "data", "new_questions.json")
CORE_TOON_PATH = os.path.join(PROJECT_ROOT, "data", "core.toon")

def main():
    if not os.path.exists(JSON_PATH):
        print(f"Error: JSON file not found at {JSON_PATH}")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        new_questions = json.load(f)

    print(f"Loaded {len(new_questions)} new questions from JSON.")

    # Read existing core.toon to check for duplicate IDs
    existing_ids = set()
    if os.path.exists(CORE_TOON_PATH):
        with open(CORE_TOON_PATH, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("- id:"):
                    existing_ids.add(line.split("- id:")[1].strip())
    print(f"Found {len(existing_ids)} existing IDs in core.toon.")

    # Filter out duplicates
    to_append = [q for q in new_questions if q["id"] not in existing_ids]
    print(f"Need to append {len(to_append)} unique questions (filtered out {len(new_questions) - len(to_append)} duplicates).")

    if not to_append:
        print("Nothing to append. Exiting.")
        return

    # Convert to TOON format and append
    with open(CORE_TOON_PATH, "a", encoding="utf-8") as f:
        # Write a newline first to ensure clean separation
        f.write("\n")
        
        for q in to_append:
            f.write(f"- id: {q['id']}\n")
            f.write(f"  source: {q['source']}\n")
            f.write(f"  category: {q['category']}\n")
            f.write(f"  niche: {q['niche']}\n")
            f.write(f"  difficulty: {q['difficulty']}\n")
            f.write(f"  question: {q['question']}\n")
            f.write("  answer: |\n")
            
            # Write multiline answer block with 4 spaces indent
            for line in q["answer"].splitlines():
                if line.strip() == "":
                    f.write("\n")
                else:
                    f.write(f"    {line}\n")

    print(f"Successfully appended {len(to_append)} questions to {CORE_TOON_PATH}")

if __name__ == "__main__":
    main()
