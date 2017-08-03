const Discord = require('./discord');
const logger = require('./util/Logger');
const config = require('../config');
const raven = require('./util/raven');

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

const client = new Discord.Client({
  presence: (shard_id) => ({
    status: 'online',
    game: { name: `@Google help | S${shard_id}` },
  }),
});

client.raven = raven(config.sentry[process.env.NODE_ENV]);

let prefix;
const commands = client.commands = require('./commands');

client.on('READY', (packet, shard_id) => {
  logger.log('Client', 'READY', shard_id);
  prefix = new RegExp(`^(<@!?${packet.user.id}>|!${packet.user.username}bot|ok ${packet.user.username}(bot)?,?)`, 'i');
});

client.on('MESSAGE_CREATE', (message) => {
  if (!prefix || !prefix.test(message.content)) return;
  const raven_context = {
    message,
    command: null,
  };
  try {
    let [command, ...args] = message.content.replace(prefix, '').trim().split(' ');
    if (!command) return;
    message.content = args.join(' ');
    if (command in commands) {
      command = commands[command];
      if (command.owner && message.author.id !== '173547401905176585') return;
    } else {
      message.content = `${command} ${message.content}`;
      command = commands.search;
    }
    raven_context.command = { command: command.name, args };
    logger.log('COMMAND', command.name, `nsfw=${message.channel.nsfw}`);
    command(message);
  } catch (err) {
    client.raven.captureException(err, {
      extra: raven_context,
    });
  }
});

client.login(config.tokens[process.env.NODE_ENV]);
