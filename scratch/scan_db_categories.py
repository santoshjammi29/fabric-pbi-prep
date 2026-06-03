import re

def get_unique_field_values(filepath, field_name):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    pattern = rf'"{field_name}"\s*:\s*"([^"]+)"'
    values = re.findall(pattern, content)
    return set(values), len(values)

def main():
    for name, filepath in [
        ('questions.js', '/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/questions.js'),
        ('data_de.js', '/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/data_de.js'),
        ('data_personalised.js', '/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/data_personalised.js'),
    ]:
        print(f"=== {name} ===")
        cats, count = get_unique_field_values(filepath, 'category')
        print(f"Categories ({len(cats)}): {sorted(list(cats))[:10]}...")
        diffs, _ = get_unique_field_values(filepath, 'difficulty')
        print(f"Difficulties: {diffs}")
        if 'niche' in get_unique_field_values(filepath, 'niche')[0]:
            pass
        niches, _ = get_unique_field_values(filepath, 'niche')
        print(f"Niches count: {len(niches)}")
        domains, _ = get_unique_field_values(filepath, 'domain')
        print(f"Domains: {domains}")

if __name__ == '__main__':
    main()
