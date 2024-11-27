const fs = require('fs');
const path = require('path');

// Define the path to the footer.tsx file
const footerPath = path.join(__dirname, '../../src/components/ui/footer.tsx');

// Read the footer.tsx file
fs.readFile(footerPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading footer.tsx:', err);
        return;
    }

    // Get the commit link from the environment variable
    const commitLink = process.env.GITHUB_SHA ? `https://github.com/DeadCodeGames/WikiPhilosophyGame/commit/${process.env.GITHUB_SHA}` : undefined;
    const shortSHA = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.match(/.{1,7}/g)[0] : undefined;

    // Replace the NODE_ENV check with the new string
    const updatedData = data.replace(
        '{t(process.env.NODE_ENV === "development" ? "footer.devmode" : "footer.prodmode")}',
        `${(commitLink && shortSHA) ? `<Trans i18nKey="footer.deployedSHA" values={{ sha: "${shortSHA}" }}><a href="${commitLink}"></a></Trans>` : "{t('footer.deployed')}"}`
    );

    // Write the updated content back to footer.tsx
    fs.writeFile(footerPath, updatedData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing footer.tsx:', err);
        } else {
            console.log('footer.tsx updated successfully.');
        }
    });
});
