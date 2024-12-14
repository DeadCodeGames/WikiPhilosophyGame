const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute shell commands
function execCommand(command) {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
}

// Function to build the project
function buildProject(branch, outputDir, prNumber = null) {
    console.log(`Building branch: ${branch}`);
    fs.cpSync(path.join(".github"), path.join(".build", "temp", ".github"), { recursive: true });
    execCommand(`git checkout ${branch} --force`);
    execCommand('git pull --recurse-submodules')
    const lastCommitSHA = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    fs.cpSync(path.join(".build", "temp", ".github"), path.join(".github"), { recursive: true });
    fs.rmSync(path.join(".build", "temp", ".github"), { recursive: true });
    execCommand(`node .github/workflows/prebuild.js ${lastCommitSHA}${prNumber !== null ? ` ${prNumber}` : ''}`);
    execCommand('npm install --force'); // Install dependencies
    execCommand('npm run build'); // Build the project

    // Check if the output directory exists, create it if it doesn't
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir)
    }

    // Copy build files to output directory
    fs.cpSync(path.join("build"), outputDir, { recursive: true });
}

function buildPreview() {
    fs.cpSync(path.join(".github", "workflows", "preview.tsx"), path.join("src", "app", "page.tsx"));
    execCommand('npm run build');
    
    fs.cpSync(path.join("build"), path.join(".build", "preview"), { recursive: true });
}

// Main function
function main() {
    const buildDir = path.join(".build");
    const prPreviewDir = path.join(".build", "preview");

    // Checkout the main branch and build it
    execCommand('git fetch');
    buildProject('main', buildDir);
    buildPreview()

    // Get all open PRs
    const prList = execSync('gh pr list --state open --json number,headRefName,commits', { encoding: 'utf-8' });
    const prs = JSON.parse(prList);

    // Build each PR branch
    prs.forEach(pr => {
        const prBranch = pr.headRefName;
        const prNumber = pr.number;
        const outputDir = path.join(prPreviewDir, `pr-${prNumber}`);

        buildProject(prBranch, outputDir, prNumber);
    });

    console.log('All builds completed.');
    fs.rm(path.join(".build", "temp"), { recursive: true });
}

// Run the main function
main();