import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")

def parse_toon(text):
    lines = text.splitlines()
    records = []
    current_obj = None
    current_field = None
    block_lines = None
    
    for line in lines:
        # Check if we are inside a multiline block
        if current_field is not None and block_lines is not None:
            if line.strip() == '':
                block_lines.append('')
                continue
            
            # Count leading spaces
            indent = len(line) - len(line.lstrip(' '))
            if indent >= 4:
                block_lines.append(line[4:])
                continue
            else:
                # End of block string
                # Clean trailing empty lines if any
                val = '\n'.join(block_lines)
                current_obj[current_field] = val
                current_field = None
                block_lines = None
        
        # Check if it's a new record starting with a hyphen
        if line.startswith('- '):
            current_obj = {}
            records.append(current_obj)
            
            kv_line = line[2:]
            colon_idx = kv_line.find(':')
            if colon_idx != -1:
                key = kv_line[:colon_idx].strip()
                value = kv_line[colon_idx+1:].strip()
                if value == '|':
                    current_field = key
                    block_lines = []
                else:
                    current_obj[key] = value
            continue
            
        # Parse normal key-value properties
        if line.startswith('  '):
            kv_line = line[2:]
            colon_idx = kv_line.find(':')
            if colon_idx != -1:
                key = kv_line[:colon_idx].strip()
                value = kv_line[colon_idx+1:].strip()
                if value == '|':
                    current_field = key
                    block_lines = []
                elif current_obj is not None:
                    current_obj[key] = value
                    
    # Flush remaining block at the end
    if current_obj is not None and current_field is not None and block_lines is not None:
        val = '\n'.join(block_lines)
        current_obj[current_field] = val
        
    return records

def build_file(toon_filename, output_filename, js_var_name):
    toon_path = os.path.join(DATA_DIR, toon_filename)
    output_path = os.path.join(PROJECT_ROOT, output_filename)
    
    if not os.path.exists(toon_path):
        print(f"⚠️ Warning: Source {toon_filename} not found at {toon_path}")
        return
        
    with open(toon_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    records = parse_toon(content)
    # Add compatibility aliases for all databases
    for r in records:
        if 'category' in r:
            r['domain'] = r['category']
        if 'niche' in r:
            r['subdomain'] = r['niche']
        if 'domain' in r:
            r['category'] = r['domain']
        if 'subdomain' in r:
            r['niche'] = r['subdomain']
            
    print(f"✅ Parsed {len(records)} records from {toon_filename}")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(f"window.{js_var_name} = ")
        json.dump(records, f, indent=2, ensure_ascii=False)
        f.write(";\n")
    print(f"✅ Written {output_filename} containing window.{js_var_name}")

def main():
    print("🚀 Starting compilation of TOON databases...")
    build_file("core.toon", "questions.js", "QUESTIONS_DB")
    build_file("general.toon", "data_de.js", "QUESTIONS_DE_DB")
    build_file("personalised.toon", "data_personalised.js", "PERSONALISED_QUESTIONS")
    print("🎉 DB compilation completed!")

if __name__ == '__main__':
    main()
