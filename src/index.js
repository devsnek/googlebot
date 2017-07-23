const Discord = require('./discord');
const logger = require('./util/Logger');
const config = require('../config');

const client = new Discord.Client({
  presence: (shard_id) => ({
    status: 'online',
    game: { name: `@Google help | S${shard_id}` },
  }),
});

let prefix;
const commands = client.commands = require('./commands');

client.on('READY', (packet, shard_id) => {
  logger.log('Client', 'READY', shard_id);
  prefix = new RegExp(`^(<@!?${packet.user.id}>|!${packet.user.username}bot)`, 'i');
});

client.on('MESSAGE_CREATE', (message) => {
  if (!prefix || !prefix.test(message.content)) return;
  let [command, ...args] = message.content.replace(prefix, '').trim().split(' ');
  message.content = args.join(' ');
  if (command in commands) {
    command = commands[command];
    if (command.owner && message.author.id !== '173547401905176585') return;
    logger.log('COMMAND', command.name, `nsfw=${message.channel.nsfw}`);
    command(message);
  }
});

client.login(config.token);
