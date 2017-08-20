if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

const Discord = require('./discord');
const logger = require('./util/Logger');
const config = require('../config');

const client = new Discord.Client({
  presence: (shard_id) => ({
    status: 'online',
    game: { name: `@Google help | S${shard_id}` },
  }),
});

require('./util/blocked')((n) => logger.error('UV BLOCK', n));

client.raven = require('./util/raven');
client.ua = require('./util/ua');

let prefix;
const commands = client.commands = require('./commands');

client.on('READY', (packet) => {
  prefix = new RegExp(`^(<@!?${packet.user.id}>|!${packet.user.username}bot|ok ${packet.user.username}(bot)?,?)`, 'i');
});

client.on('MESSAGE_CREATE', (message, shard_id) => {
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
    logger.log('COMMAND', shard_id, command.name, `nsfw=${message.channel.nsfw}`);
    command(message);
    // client.stats.increment(`commands.${command.name}`);
  } catch (err) {
    const event = client.raven.captureException(err, {
      extra: raven_context,
    });
    logger.log('SENTRY EXCEPTION', event);
  }
});

client.on('CONNECTING', () => {
  logger.log('SPAWNING COUNT', client.shard_count);
  // client.stats.gauge('shard_count', client.shard_count);
  setTimeout(() => {
    updateStats();
    setInterval(() => updateStats(), 60e3);
  }, client.shard_count * 6e3);
});

client.on('SHARD_STATUS', (id, status) => {
  // client.stats.gauge(`shards.${id}`, status);
});

function updateStats() {
  if (client.unavailable > 0.07) return;
  logger.log('GUILD COUNT', client.guilds.size);
  logger.log('CHANNEL COUNT', client.channels.size);
  // client.stats.gauge('guilds', client.guilds.size);
  // client.stats.gauge('channels', client.channels.size);
}

client.login(config.tokens[process.env.NODE_ENV]);
