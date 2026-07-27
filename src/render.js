'use strict';

const fs = require('fs');
const ejs = require('ejs');

const templateFilePath = `${__dirname}/awesome-template.md`;

/**
 * Renders the readme markdown from the awesome data, without writing to disk.
 * Shared by the build script and the validator so both use the same output.
 */
function renderReadme(data) {
    const template = fs.readFileSync(templateFilePath, 'utf8');
    return ejs.render(template, data);
}

module.exports = renderReadme;
