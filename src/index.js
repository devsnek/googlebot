const Discord = require('./discord');
const config = require('../config');

const client = new Discord.Client();

client.on('READY', () => {
  logger.log('Client', 'ready');
});

client.on('MESSAGE_CREATE', (message) => {
  client.api.channels(message.channel_id).messages.post({
    data: { content: 'hi' },
  });
});

client.login(config.token);
