const Discord = require('./discord');
const logger = require('./util/logger');
const config = require('../config');

const client = new Discord.Client({
  presence: (shard_id) => ({
    status: 'online',
    game: { name: `@Google help | S${shard_id}` },
  }),
});

client.on('READY', (packet, shard_id) => {
  logger.log('Client', 'READY', shard_id);
});

client.on('MESSAGE_CREATE', (message) => {
  if (message.author.id !== '173547401905176585') return;
  if (message.content === '!ping') {
    message.reply(`Pong! ${Date.now() - message.timestamp}ms`);
  } else if (message.content.startsWith('!eval')) {
    let ret;
    try {
      ret = eval(message.content.replace('!eval', '').trim());
    } catch (err) {
      ret = err.message;
    }
    message.reply(`\`\`\`js\n${ret}\n\`\`\``);
  }
});

client.login(config.token);
