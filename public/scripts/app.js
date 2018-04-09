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
      axios.get('/api/most_common').then(res => {
        app.common_list = res.data;
      });
      axios.get('/api/lists').then(res => {
        app.scores = res.data;
      })
    }
  });
};

