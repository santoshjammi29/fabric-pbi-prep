const { spawn } = require('child_process');
const http = require('http');

console.log("🚀 Initializing test server environment on port 8080...");

// Spin up python3 http.server in the background
const serverProcess = spawn('python3', ['-m', 'http.server', '8080'], {
    stdio: 'ignore',
    detached: true
});
serverProcess.unref();

let pollAttempts = 0;
const maxAttempts = 30; // 15 seconds

function checkServer() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:8080', (res) => {
            resolve(true);
        });
        req.on('error', () => {
            resolve(false);
        });
    });
}

async function startTests() {
    while (pollAttempts < maxAttempts) {
        pollAttempts++;
        const isUp = await checkServer();
        if (isUp) {
            console.log("✅ Test server is up and listening on port 8080!");
            runTestSequences();
            return;
        }
        await new Promise(r => setTimeout(r, 500));
    }
    console.error("❌ Failed to start test server on port 8080 within 15 seconds.");
    cleanupAndExit(1);
}

const testSuites = [
    'tests/test_audit.js',
    'tests/test_ui.js',
    'tests/test_dom.js',
    'tests/test_portal.js',
    'tests/test_explainer.js',
    'tests/test_cheatsheet.js',
    'tests/test_personalised.js',
    'tests/test_concepts.js',
    'tests/test_gcc.js',
    'tests/test_sparksql.js',
    'tests/test_sidebar.js',
    'tests/test_architecture.js',
    'tests/test_dashboard.js'
];

let currentSuiteIndex = 0;

function runNextSuite() {
    if (currentSuiteIndex >= testSuites.length) {
        console.log("\n🎉 ALL TEST SUITES PASSED SUCCESSFULLY!");
        cleanupAndExit(0);
        return;
    }

    const suite = testSuites[currentSuiteIndex];
    console.log(`\n=== Running Test Suite [${currentSuiteIndex + 1}/${testSuites.length}]: ${suite} ===`);
    
    const suiteProcess = spawn('node', [suite], { stdio: 'inherit' });
    
    suiteProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`\n❌ Test suite ${suite} failed with exit code ${code}`);
            cleanupAndExit(code);
        } else {
            currentSuiteIndex++;
            runNextSuite();
        }
    });
}

function runTestSequences() {
    runNextSuite();
}

function cleanupAndExit(code) {
    console.log("🧹 Cleaning up server process...");
    try {
        if (serverProcess.pid) {
            process.kill(-serverProcess.pid, 'SIGTERM'); // Kill process group
        }
    } catch (e) {
        // Process might already be dead
    }
    
    // Fallback: kill anything running on port 8080
    const killCmd = spawn('pkill', ['-f', 'python3 -m http.server 8080']);
    killCmd.on('close', () => {
        process.exit(code);
    });
}

startTests();
