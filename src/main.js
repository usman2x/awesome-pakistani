'use strict';

const fs = require('fs');

const renderReadme = require('./render');

const outputFilePath = `${__dirname}/../README.md`;

let data = require('./../awesome-data.json');

fs.writeFileSync(outputFilePath, renderReadme(data));
