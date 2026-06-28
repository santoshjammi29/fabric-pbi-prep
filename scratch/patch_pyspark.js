const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data_pyspark.js');
let content = fs.readFileSync(filePath, 'utf8');

// To evaluate the file and load window.PYSPARK_DATA
const window = {};
eval(content.replace('window.PYSPARK_DATA =', 'window.PYSPARK_DATA ='));

const data = window.PYSPARK_DATA;

for (const item of data) {
    if (item.level === 'advanced' || item.level === 'architect') {
        let code = item.code.trim();
        // Check if already wrapped
        if (!code.startsWith('try:')) {
            // Indent the original code by 4 spaces
            const indentedCode = code.split('\n').map(line => '    ' + line).join('\n');
            item.code = `import logging

# Configure pipeline logger
logger = logging.getLogger("MedallionPipeline")

try:
${indentedCode}
except Exception as e:
    logger.error(f"Pipeline stage failed in ${item.title}: {str(e)}")
    raise`;
        }
    }
}

// Now write it back in the exact same format
const newContent = `/* data_pyspark.js — PySpark Data Engineering Concepts
   Santosh Jammi | Principal Data Architect
   Coverage: Beginner → Intermediate → Advanced → Architect
*/
window.PYSPARK_DATA = ${JSON.stringify(data, null, 2)};
`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("SUCCESS: data_pyspark.js patched with try/except error handling!");
