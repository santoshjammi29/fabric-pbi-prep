#!/usr/bin/env python3
"""
add_difficulty.py
Assigns difficulty levels (EASY / MEDIUM / HARD) to all questions.
Strategy: within each (category, niche) group, assign the first 1/3 as EASY,
          middle 1/3 as MEDIUM, and remaining as HARD.
          This ensures a balanced, predictable distribution.
"""
import json
import glob
import math
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

def assign_difficulty(questions):
    """Assign EASY/MEDIUM/HARD to questions grouped by niche."""
    # Group by niche within the file
    niches = {}
    for q in questions:
        niche = q.get('niche', 'General')
        niches.setdefault(niche, []).append(q)
    
    for niche_qs in niches.values():
        n = len(niche_qs)
        easy_end = math.ceil(n / 3)
        med_end = math.ceil(2 * n / 3)
        for i, q in enumerate(niche_qs):
            if i < easy_end:
                q['difficulty'] = 'EASY'
            elif i < med_end:
                q['difficulty'] = 'MEDIUM'
            else:
                q['difficulty'] = 'HARD'
    return questions

total_by_diff = {'EASY': 0, 'MEDIUM': 0, 'HARD': 0}
files = sorted(glob.glob(os.path.join(DATA_DIR, '*.json')))

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    data = assign_difficulty(data)

    for q in data:
        total_by_diff[q['difficulty']] = total_by_diff.get(q['difficulty'], 0) + 1

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f'✅  Updated {len(data)} questions in {os.path.basename(filepath)}')

print(f'\nDifficulty distribution: {total_by_diff}')
print(f'Grand total: {sum(total_by_diff.values())}')
