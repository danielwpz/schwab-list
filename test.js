'use strict';

const parser = require('./lib/data_source.js');

parser.getSchwabScores().then(console.log);