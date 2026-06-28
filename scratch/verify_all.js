const fs = require('fs');
const path = require('path');

function loadJsFile(filePath, varName) {
    const content = fs.readFileSync(filePath, 'utf8');
    const window = {};
    eval(content);
    return window[varName];
}

const archData = loadJsFile(path.join(__dirname, '../data_architecture.js'), 'ARCHITECTURE_DATA');
const deData = loadJsFile(path.join(__dirname, '../data_de.js'), 'QUESTIONS_DE_DB');
const pysparkData = loadJsFile(path.join(__dirname, '../data_pyspark.js'), 'PYSPARK_DATA');
const mssqlData = loadJsFile(path.join(__dirname, '../data_mssql.js'), 'MSSQL_DATA');

console.log('=== DATASET COUNT VERIFICATION ===');
console.log(`Architecture Hub: ${archData.length} records`);
console.log(`Data Engineering Hub: ${deData.length} records`);
console.log(`PySpark Concepts: ${pysparkData.length} records`);
console.log(`MS SQL Concepts: ${mssqlData.length} records`);
console.log();

console.log('=== ISSUES CHECK ===');

// Check Architecture Hub templates
const templatePhrase = 'allows the data platform to optimize logical paths by organizing the table layout';
const templated = archData.filter(x => x.answer && x.answer.includes(templatePhrase));
console.log(`Remaining templated answers in Architecture Hub: ${templated.length}`);

// Check data_de.js issues
const deIssues = [];
deData.forEach(item => {
    const a = (item.answer || '').toLowerCase();
    if (a.includes('azure data lake store') && !a.includes('gen2')) {
        deIssues.push({ type: 'ADLS Gen1', id: item.id });
    }
    if (a.includes('mesos')) {
        deIssues.push({ type: 'Mesos', id: item.id });
    }
    if (a.includes('sqoop') && !a.includes('legacy')) {
        deIssues.push({ type: 'Sqoop', id: item.id });
    }
    if (a.includes('flume') && !a.includes('legacy')) {
        deIssues.push({ type: 'Flume', id: item.id });
    }
    if (item.difficulty === 'HARD' && (item.answer || '').length < 120) {
        deIssues.push({ type: 'Short HARD Answer', id: item.id });
    }
});
console.log(`Remaining issues in data_de.js: ${deIssues.length}`);
if (deIssues.length > 0) {
    console.log('First 5 issues:', deIssues.slice(0, 5));
}

// Check mssql_data SELECT *
const sqlIssues = [];
mssqlData.forEach(item => {
    const code = item.code || '';
    if (code.includes('SELECT *') && !code.includes('SELECT report_date, *')) {
        sqlIssues.push(item.id);
    }
});
console.log(`Remaining SELECT * issues in data_mssql.js: ${sqlIssues.length}`);

// Check data_pyspark error handling
const pyIssues = [];
pysparkData.forEach(item => {
    if ((item.level === 'advanced' || item.level === 'architect') && !(item.code || '').includes('import logging')) {
        pyIssues.push(item.id);
    }
});
console.log(`Remaining missing error handling issues in data_pyspark.js: ${pyIssues.length}`);

