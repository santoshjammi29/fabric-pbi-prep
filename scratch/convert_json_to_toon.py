import json
import os

def to_toon_str(val):
    if not val:
        return ''
    val = str(val).strip()
    if '\n' in val:
        lines = val.splitlines()
        # Indent each line by 4 spaces
        indented_lines = ['    ' + line for line in lines]
        return '|\n' + '\n'.join(indented_lines)
    else:
        return val

def serialize_to_toon(records, source_name):
    lines = []
    for r in records:
        lines.append(f"- id: {r.get('id', '').strip()}")
        lines.append(f"  source: {source_name}")
        
        # Mapping category
        category = r.get('category', r.get('domain', ''))
        lines.append(f"  category: {category.strip()}")
        
        # Mapping niche
        niche = r.get('niche', r.get('subdomain', ''))
        lines.append(f"  niche: {niche.strip()}")
        
        # Mapping difficulty
        diff = r.get('difficulty', 'ARCHITECT')
        lines.append(f"  difficulty: {diff.strip().upper()}")
        
        # Format question
        q_val = to_toon_str(r.get('question', ''))
        lines.append(f"  question: {q_val}")
        
        # Format answer
        a_val = to_toon_str(r.get('answer', ''))
        lines.append(f"  answer: {a_val}")
        
    return '\n'.join(lines)

def main():
    data_dir = '/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/data'
    
    # 1. Core Q&A
    with open(os.path.join(data_dir, 'core.json'), 'r', encoding='utf-8') as f:
        core_data = json.load(f)
    core_toon = serialize_to_toon(core_data, 'Core Architect')
    with open(os.path.join(data_dir, 'core.toon'), 'w', encoding='utf-8') as f:
        f.write(core_toon)
    print(f"Serialized core.toon with {len(core_data)} records.")

    # 2. General DE Q&A
    with open(os.path.join(data_dir, 'general.json'), 'r', encoding='utf-8') as f:
        general_data = json.load(f)
    general_toon = serialize_to_toon(general_data, 'General Data Engineering')
    with open(os.path.join(data_dir, 'general.toon'), 'w', encoding='utf-8') as f:
        f.write(general_toon)
    print(f"Serialized general.toon with {len(general_data)} records.")

    # 3. Personalised Q&A
    with open(os.path.join(data_dir, 'personalised.json'), 'r', encoding='utf-8') as f:
        pers_data = json.load(f)
    pers_toon = serialize_to_toon(pers_data, 'Personalised Prep')
    with open(os.path.join(data_dir, 'personalised.toon'), 'w', encoding='utf-8') as f:
        f.write(pers_toon)
    print(f"Serialized personalised.toon with {len(pers_data)} records.")

if __name__ == '__main__':
    main()
