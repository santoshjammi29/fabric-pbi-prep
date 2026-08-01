#!/usr/bin/env python3
"""
Fix pain point N: Add data-label attributes to GCC directory table cells
so the CSS @media mobile card-collapse can display column headers.
"""
import re, os

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html_path = os.path.join(base, 'index.html')

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Column headers matching the <thead> order
HEADERS = [
    'Risk Level',
    'Company',
    'Sector',
    'Salary (7+ Yrs)',
    'Stability & Risk',
    'Jobs Portal',
]

# Find the gcc table
table_start = content.find('<table class="gcc-table" id="gcc-directory-table">')
table_end = content.find('</table>', table_start) + len('</table>')

if table_start == -1:
    print('GCC table not found!')
    exit(1)

table_html = content[table_start:table_end]

# Find tbody
tbody_start = table_html.find('<tbody>')
tbody_end = table_html.find('</tbody>') + len('</tbody>')
tbody_html = table_html[tbody_start:tbody_end]

# Process each <tr>
rows = re.findall(r'(<tr(?:\s[^>]*)?>)(.*?)(</tr>)', tbody_html, re.DOTALL)
new_tbody = tbody_html

for tr_open, tr_content, tr_close in rows:
    old_tr = tr_open + tr_content + tr_close
    tds = re.findall(r'(<td(?:\s[^>]*)?>)(.*?)(</td>)', tr_content, re.DOTALL)
    new_tr_content = tr_content
    for col_idx, (td_open, td_content, td_close) in enumerate(tds):
        if col_idx < len(HEADERS) and 'data-label' not in td_open:
            label = HEADERS[col_idx]
            new_td_open = re.sub(r'>$', f' data-label="{label}">', td_open)
            old_td = td_open + td_content + td_close
            new_td = new_td_open + td_content + td_close
            new_tr_content = new_tr_content.replace(old_td, new_td, 1)
    new_tr = tr_open + new_tr_content + tr_close
    new_tbody = new_tbody.replace(old_tr, new_tr, 1)

new_table_html = table_html[:tbody_start] + new_tbody + table_html[tbody_end:]
new_content = content[:table_start] + new_table_html + content[table_end:]

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

count = new_content.count('data-label=')
print(f'Success: added data-label to {count} cells')
