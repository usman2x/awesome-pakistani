'use strict';

const fs = require('fs');
const ejs = require('ejs');

const templateFilePath = `${__dirname}/awesome-template.md`;
const outputFilePath = `${__dirname}/../README.md`;

let data = require('./../awesome-data.json');

const template = fs.readFileSync(templateFilePath, 'utf8');
const markdown = ejs.render(template, data);

fs.writeFileSync(outputFilePath, markdown);
