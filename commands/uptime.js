const toHHMMSS = require('../util/toHHMMSS');

module.exports = {
  main: async message => message.channel.sendMessage('Uptime: ' + toHHMMSS(message.client.uptime / 1000)),
  hide: true
};
