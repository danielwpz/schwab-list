'use strict';

const _ = require('lodash');
const moment = require('moment');
const dataSoure = require('./data_source');

function sortByOccurrenceThenScore(a, b) {
  let occurA = a.occurrence;
  let occurB = b.occurrence;
  occurA = occurA.sort((x, y) => moment(x).isBefore(y));
  occurB = occurB.sort((x, y) => moment(x).isBefore(y));

  if (moment(occurA[0]).isBefore(occurB[0])) {
    return -1;
  } else if (moment(occurB[0]).isBefore(occurA[0])) {
    return 1;
  } else {
    if (occurA.length === occurB.length) {
      return a.score - b.score;
    }

    return occurA.length - occurB.length;
  }
}

/**
 * This returns the sorted list of all stocks with their existence in
 * each date.
 */
async function mostCommonStocks() {
  const data = await dataSoure.getSchwabScores();
  const result = [];

  _.forEach(data, (scores, date) => {
    scores.forEach(s => {
      const scoreInResult = _.find(result, { symbol: s.symbol });
      if (scoreInResult) {
        scoreInResult.occurrence.push(date);

        if (moment(date).isAfter(scoreInResult.latestOccurrence)) {
          scoreInResult.score = s.score;
          scoreInResult.latestOccurrence = date;
        }
      } else {
        result.push({
          symbol: s.symbol,
          name: s.name,
          occurrence: [date],
          score: s.score,
          latestOccurrence: date
        });
      }
    });
  });

  return result.sort(sortByOccurrenceThenScore).reverse();
}

async function getAllScores() {
  return await dataSoure.getSchwabScores();
}

module.exports = {
  mostCommonStocks,
  getAllScores
};
