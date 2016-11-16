module.exports = {
  main: async message => message.channel.sendMessage('Uptime: ' + message.client.util.toHHMMSS(message.client.uptime / 1000)),
  hide: true
};
