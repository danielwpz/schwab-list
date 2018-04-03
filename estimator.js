'use strict';

const average = require('average');

class Estimator {
  constructor(list) {
    this.m = average(list.map(ratings => ratings.filter(x => x > 0).length));

    let sum = 0;
    let n = 0;

    list.forEach(ratings => {
      ratings.forEach(r => {
        if (r > 0) {
          n += 1;
          sum += r;
        }
      });
    });

    this.c = sum / n;
  }

  calculate(ratings) {
    const validRatings = ratings.filter(x => x > 0);
    if (validRatings.length === 0) {
      return -1;
    }

    const sum = validRatings.reduce((a, b) => a + b);
    const v = validRatings.length;
    const r = sum / v;

    return (v / (v + this.m)) * r + (this.m / (v + this.m)) * this.c;
  }
}

module.exports = Estimator;