import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Simple direct string replacements based on the prompt
    replacements = {
        # Light Tokens
        "--apple-blue: #0071e3;": "--apple-green: #34c759;",
        "--apple-blue-glow: #2997ff;": "--apple-green-glow: #30d158;",
        "--bg-gradient-light: linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%);": "--bg-gradient-light: linear-gradient(180deg, #f4f7f5 0%, #e6ebe7 100%);",
        "--bg-gradient-dark: linear-gradient(180deg, #000000 0%, #0c0c0e 50%, #161618 100%);": "--bg-gradient-dark: linear-gradient(180deg, #090e0b 0%, #111813 50%, #17221a 100%);",
        "--card-bg-light: rgba(255, 255, 255, 0.85);": "--card-bg-light: rgba(255, 255, 255, 0.88);",
        "--card-bg-dark: rgba(28, 28, 30, 0.75);": "--card-bg-dark: rgba(20, 28, 23, 0.75);",
        "--card-border-light: rgba(0, 0, 0, 0.08);": "--card-border-light: rgba(52, 199, 89, 0.15);",
        "--card-border-dark: rgba(255, 255, 255, 0.12);": "--card-border-dark: rgba(48, 209, 88, 0.18);",
        "--text-primary-light: #1d1d1f;": "--text-primary-light: #162019;",
        "--text-primary-dark: #f5f5f7;": "--text-primary-dark: #f2f7f3;",
        "--text-secondary-light: #6e6e73;": "--text-secondary-light: #506354;",
        "--text-secondary-dark: #86868b;": "--text-secondary-dark: #9ab0a0;",
        
        # Apple Theme Overrides Light
        "--primary: #0071e3;": "--primary: #34c759;",
        "--primary-light: #0071e3;": "--primary-light: #34c759;",
        "--accent-blue: #3b66e0;": "--accent-blue: #2fb34f;",
        "--bg-gradient: linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%);": "--bg-gradient: linear-gradient(180deg, #f4f7f5 0%, #e6ebe7 100%);",
        "--card-border: rgba(0, 0, 0, 0.08);": "--card-border: rgba(52, 199, 89, 0.15);",
        "--text-primary: #1d1d1f;": "--text-primary: #162019;",
        "--text-secondary: #6e6e73;": "--text-secondary: #506354;",
        "--item-bg: rgba(0, 113, 227, 0.03);": "--item-bg: rgba(52, 199, 89, 0.12);",
        "--primary-hover: #0077ed;": "--primary-hover: #28cd41;",
        
        # Theme Dark
        "--primary: #4f7cff;": "--primary: #30d158;",
        "--primary-light: #4f7cff;": "--primary-light: #30d158;",
        "--accent-blue: #4f7cff;": "--accent-blue: #30d158;",
        "--bg-gradient: linear-gradient(180deg, #000000 0%, #0c0c0e 50%, #161618 100%);": "--bg-gradient: linear-gradient(180deg, #090e0b 0%, #111813 50%, #17221a 100%);",
        "--card-border: rgba(255, 255, 255, 0.12);": "--card-border: rgba(48, 209, 88, 0.18);",
        "--text-primary: #f5f5f7;": "--text-primary: #f2f7f3;",
        "--text-secondary: #86868b;": "--text-secondary: #9ab0a0;",
        "--primary-hover: #608dff;": "--primary-hover: #34c759;",
        
        # Categories Light & Dark
        "--cat-pbi: #0071e3;": "--cat-pbi: #34c759;",
        "--cat-pbi: #4f7cff;": "--cat-pbi: #34c759;",
        "--cat-adf: #30b0c7;": "--cat-adf: #10b981;",
        "--cat-adf: #64d2ff;": "--cat-adf: #10b981;",
        "--cat-cloud: #5856d6;": "--cat-cloud: #059669;",
        "--cat-cloud: #5e5ce6;": "--cat-cloud: #059669;",
        "--cat-viz: #0071e3;": "--cat-viz: #34c759;",
        "--cat-viz: #64d2ff;": "--cat-viz: #34c759;",
        
        # Global replacements
        "background: #0071e3;": "background: #34c759;",
        "#0071e3": "#34c759",
        "#2997ff": "#30d158",
        "#3b66e0": "#28cd41",
        "#4f7cff": "#34c759",
        "#2b3fff": "#34c759",
        "#60a5fa": "#30d158",
        "#3b82f6": "#30d158",
        "#30b0c7": "#10b981",
        "#5856d6": "#059669",
        "#7c3aed": "#059669",
        "#06b6d4": "#10b981",
        "rgba(0, 113, 227,": "rgba(52, 199, 89,",
        "rgba(43, 63, 255,": "rgba(52, 199, 89,",
        "rgba(108, 92, 231,": "rgba(52, 199, 89,",
    }

    for old_str, new_str in replacements.items():
        content = content.replace(old_str, new_str)
        
    with open(filepath, 'w') as f:
        f.write(content)

process_file('/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/styles.css')
process_file('/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/animations.css')

