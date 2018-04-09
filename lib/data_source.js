'use strict';

const fs = require('fs');
const path = require('path');
const walk = require('walk');
const utf8 = require('utf8');
const cheerio = require('cheerio');
const _ = require('lodash');
const Promise = require('bluebird');

const Estimator = require('./estimator');

const ratingCompanyList = [
  'ArgusRating',
  'CFRAStars',
  'CreditSuisse',
  'NedDavis',
  'ReutersRating'
];

function parseRawJSON(jsonString) {
  const json = JSON.parse(jsonString);
  const encodedHtml = json.Module;
  return utf8.decode(encodedHtml);
}

function getRatingList(html) {
  const $ = cheerio.load(html);

  function buildRatingFromRow(row) {
    const symbol = $('td.Symbol a', row).text();
    const name = $('td.CompanyName', row).text();
    const ratings = ratingCompanyList.map(company => {
      return parseInt($(`td.${company}`, row).attr('tsraw'));
    });
    return {
      symbol,
      name,
      ratings
    };
  }

  const tableRows = $('tbody').children();

  return _.map(tableRows, buildRatingFromRow);
}

function getScore(ratingList) {
  const ratings = _.map(ratingList, 'ratings');
  const estimator = new Estimator(ratings);

  return ratingList.map(r => {
    r.score = 20 * estimator.calculate(r.ratings);
    return r;
  });
}

function processData(rawJson) {
  const html = parseRawJSON(rawJson);
  const ratings = getRatingList(html);
  const scores = getScore(ratings);
  return scores.sort((a, b) => b.score - a.score);
}

function getSchwabScores() {
  return new Promise((resolve, reject) => {
    const walker = walk.walk('data');
    const results = {};

    walker.on('file', (root, fileStat, next) => {
      console.log('Got file', fileStat.name);

      const fileDate = fileStat.name.split('.')[0];
      const file = fs.readFileSync(path.join('data', fileStat.name));
      const result = processData(file);
      results[fileDate] = result;

      next();
    });

    walker.on('end', () => {
      resolve(results);
    });

  });
}


module.exports = {
  getSchwabScores: _.memoize(getSchwabScores)
};