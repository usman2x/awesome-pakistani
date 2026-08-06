'use strict';

const fs = require('fs');
const ejs = require('ejs');

const templateFilePath = `${__dirname}/awesome-template.md`;

module.exports = function renderReadme(data) {
    const template = fs.readFileSync(templateFilePath, 'utf8');
    return ejs.render(template, data);
};
