import re

def parse_js_array(filepath, var_name):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find the array start
    start_match = re.search(rf'{var_name}\s*=\s*\[', content)
    if not start_match:
        return []
    
    # We can do a basic parse or count records
    # Let's count occurrences of "id":
    id_matches = re.findall(r'"id"\s*:\s*"([^"]+)"', content)
    return id_matches

def main():
    q_ids = parse_js_array('/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/questions.js', 'window.QUESTIONS_DB')
    de_ids = parse_js_array('/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/data_de.js', 'window.QUESTIONS_DE_DB')
    pers_ids = parse_js_array('/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/data_personalised.js', 'window.PERSONALISED_QUESTIONS')

    print(f"questions.js (QUESTIONS_DB) unique IDs count: {len(set(q_ids))} (total: {len(q_ids)})")
    print(f"data_de.js (QUESTIONS_DE_DB) unique IDs count: {len(set(de_ids))} (total: {len(de_ids)})")
    print(f"data_personalised.js (PERSONALISED_QUESTIONS) unique IDs count: {len(set(pers_ids))} (total: {len(pers_ids)})")

    # Overlaps
    q_set = set(q_ids)
    de_set = set(de_ids)
    pers_set = set(pers_ids)

    print(f"Overlap Q & DE: {len(q_set.intersection(de_set))}")
    print(f"Overlap Q & Pers: {len(q_set.intersection(pers_set))}")
    print(f"Overlap DE & Pers: {len(de_set.intersection(pers_set))}")

if __name__ == '__main__':
    main()
