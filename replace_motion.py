import os

def replace_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    if 'motion' in content and 'framer-motion' in content:
        new_content = new_content.replace('motion.', 'm.')
        new_content = new_content.replace('import { motion,', 'import { m,')
        new_content = new_content.replace('import { motion }', 'import { m }')
        
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))
