const superagent = require('superagent');

module.exports = (client) => {
  updateCarbon(client);
  updateAbal(client);
};

const updateCarbon = (client) => {
  if (!client.config.stats.carbon) return;
  console.log('updating carbon');
  superagent.post('https://www.carbonitex.net/discord/data/botdata.php')
    .set({ 'Content-Type': 'application/json', 'cache-control': 'no-cache' })
    .send({ servercount: client.guilds.size, key: client.config.stats.carbon }).end((err) => {
      if (!err) client.log('SUCCESSFUL CARBON UPDATE', client.guilds.size);
    });
};

const updateAbal = (client) => {
  if (!client.config.stats.abal) return;
  console.log('updating abal');
  superagent.post(`https://bots.discord.pw/api/bots/${client.user.id}/stats`)
    .set({ 'Content-Type': 'application/json', Authorization: client.config.stats.abal })
    .send({ server_count: client.guilds.size }).end((err) => {
      if (!err) client.log('SUCCESSFUL ABAL UPDATE', client.guilds.size);
    });
};
