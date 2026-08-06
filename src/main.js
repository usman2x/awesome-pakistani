'use strict';

const fs = require('fs');

const renderReadme = require('./render');

const data = require('../awesome-data.json');
const outputFilePath = `${__dirname}/../README.md`;

fs.writeFileSync(outputFilePath, renderReadme(data));
