module.exports = {
  main: async message => message.channel.send(`Uptime: ${message.client.util.toHHMMSS(message.client.uptime / 1000)}`),
  hide: true,
};
