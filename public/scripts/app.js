'use strict';

Vue.config.devtools = true;

window.onload = function () {
  const app = new Vue({
    el: '#app',
    data: {
      common_list: [],
      scores: []
    },
    mounted() {
      axios.get('/api/most_common')
        .then(res => {
          app.common_list = res.data;
        })
        .then(() => $('#score_table').DataTable());

      axios.get('/api/lists').then(res => {
        app.scores = res.data;
      });
    },
    methods: {
      priceChangePercent
    }
  });

};

function priceChangePercent(historical, key) {
  if (!historical) {
    return undefined;
  }

  const newString = historical.now.close_price;
  const baseString = historical[key].close_price;

  const newValue = parseFloat(newString);
  const baseValue = parseFloat(baseString);
  const delta = (newValue - baseValue) / baseValue;

  return (delta * 100).toFixed(1) + '%';
}