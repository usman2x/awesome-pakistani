'use strict';

const fs = require('fs');
const path = require('path');

const data = require('../awesome-data.json');
const { buildSiteFiles } = require('./site');

const outputDirectory = path.join(__dirname, '..', 'docs');
const files = buildSiteFiles(data);

const profilesDirectory = path.join(outputDirectory, 'profiles');
if (fs.existsSync(profilesDirectory)) {
    for (const entry of fs.readdirSync(profilesDirectory, { withFileTypes: true })) {
        const relativePath = `profiles/${entry.name}/index.html`;
        const staleProfileDirectory = path.join(profilesDirectory, entry.name);

        if (entry.isDirectory() && !files.has(relativePath)) {
            fs.rmSync(staleProfileDirectory, { recursive: true });
        }
    }
}

for (const [relativePath, content] of files) {
    const outputPath = path.join(outputDirectory, relativePath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content);
}

console.log(`Generated ${files.size} GitHub Pages files in docs/.`);
