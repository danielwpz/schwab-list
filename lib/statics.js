'use strict';

const _ = require('lodash');
const moment = require('moment');
const robinhood = require('node-robinhood');
const Promise = require('bluebird');
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
  let result = [];

  // build a list of stocks with their occurrence and score
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

  // fetch quote and historical data
  try {
    const prices = await Promise.map(result, r => r.symbol).then(getHistoricalData);
    prices.forEach(item => {
      const resultItem = _.find(result, { symbol: item.symbol });
      resultItem.historical = item.prices;
    });
  }catch (e) {
    console.log('Failed to fetch historical data');
    console.log(e);
    throw e;
  }

  return result.sort(sortByOccurrenceThenScore).reverse();
}

async function getHistoricalData(symbols) {

  function getRecentHistorical(hist) {
    hist = _.sortBy(hist, 'begins_at').reverse();

    return {
      now: hist[0],
      one_week: hist[5],
      one_month: hist[22],
      three_month: hist[91 - 31],
      six_month: hist[182 - 62],
      one_year: _.last(hist)
    };
  }

  let hists = [];

  try {
    hists = await robinhood.getHistoricalBySymbol(symbols, 'day');
  } catch (e) {
    console.error('Failed to get historical data for ', symbols);
    console.error(e);
    throw e;
  }

  return hists.filter(h => !!h.symbol).map(h => {
    h.prices = getRecentHistorical(h.historicals);
    return h;
  });
}

async function getAllScores() {
  return await dataSoure.getSchwabScores();
}

module.exports = {
  mostCommonStocks,
  getAllScores
};
