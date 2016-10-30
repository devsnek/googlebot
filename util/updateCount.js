const superagent = require('superagent');
const config = require('../config');

module.exports = count => {
  updateCarbon(count);
  updateAbal(count);
}

const updateCarbon = count => {
  console.log('updating carbon');
  superagent.post('https://www.carbonitex.net/discord/data/botdata.php')
    .set({'Content-Type': 'application/json', 'cache-control': 'no-cache'})
    .send({ servercount: count, key: config.stats.carbon }).end((err, res) => {
      if (!err) console.log('SUCCESSFUL CARBON UPDATE', count);
    });
}

const updateAbal = count => {
  console.log('updating abal');
  superagent.post('https://bots.discord.pw/api/bots/187406062989606912/stats')
    .set({ 'Content-Type': 'application/json', 'Authorization': config.stats.abal })
    .send({ 'server_count': count }).end((err, res) => {
      if (!err) console.log('SUCCESSFUL ABAL UPDATE', count);
    });
}
