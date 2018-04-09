'use strict';

Vue.config.devtools = true;

window.onload = function () {
  const app = new Vue({
    el: '#app',
    data: {
      common_list: [],
      latest_score: [],
      latest_score_date: ''
    },
    mounted() {
      axios.get('/api/most_common').then(res => {
        app.common_list = res.data;
      });
      axios.get('/api/lists').then(res => {
        const result = res.data;
        const dates = Object.keys(result).sort().reverse();
        app.latest_score_date = dates[0];
        app.latest_score = result[dates[0]];
      })
    }
  });
};

