'use strict';

const express = require('express');
const app = express();
const statics = require('./lib/statics');

// -- statics endpoints

app.get('/api/most_common', async (req, res) => {
  const result = await statics.mostCommonStocks();
  res.json(result);
});

// -- status endpoints

app.get('/status/health', (req, res) => {
  res.json({
    health: 'ok'
  });
});


app.listen(3300, () => {
  console.log('Listening at', 3300);
});