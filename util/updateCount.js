const axios = require('axios')
const config = require('../config');

module.exports = count => {
  updateCarbon(count);
  updateAbal(count);
}

const updateCarbon = count => {
  console.log('updating carbon');
  axios.post('https://www.carbonitex.net/discord/data/botdata.php', {
    servercount: count,
    key: config.stats.carbon
  }, {
    headers: {'Content-Type': 'application/json', 'cache-control': 'no-cache'}
  });
};

const updateAbal = count => {
  console.log('updating abal');
  axios.post('https://bots.discord.pw/api/bots/187406062989606912/stats', {
    'server_count': count
  }, {
    'Content-Type': 'application/json',
    'Authorization': config.stats.abal
  });
}
