const Discord = require('discord.js');
const chalk = require('chalk');
const config = require('./config.json');
const updateCount = require('./util/updateCount');

const manager = new Discord.ShardingManager('./bot/bot.js', {
  token: config.discord[config.env],
  shardArgs: ['--ansi', '--color']
});

manager.log = (...args) => console.log('🔰', chalk.yellow.bold('MANAGER'), ...args);

manager.stats = {
  guilds: 0,
  users: 0,
  channels: 0,
  shards: manager.shards.size
}

let alive = [];

const backend = require('./backend/index')(manager);

manager.spawn(config.discord.SHARD_COUNT);

manager.on('message', async (shard, message) => {
  switch (message.event) {
    case 'alive': {
      alive[message.data] = 1;
      if ((alive.filter(x => x === 1)).length === manager.totalShards) fetchAll();
      break;
    }
    case 'fetchAll': {
      fetchAll();
      break;
    }
    case 'fetchGuilds': {
      fetchGuilds();
      break;
    }
    case 'fetchChannels': {
      fetchChannels();
      break;
    }
    case 'fetchUsers': {
      fetchUsers();
      break;
    }
    default:
      break;
  }
});

const fetchGuilds = async () => {
  let res = await manager.broadcastEval('this.guilds.size');
  manager.stats.guilds = res = res.reduce((a, b) => a + b);
  updateCount(res);
  manager.log('FETCHED GUILDS', res);
}

const fetchChannels = async () => {
  let res = await manager.broadcastEval('this.channels.size');
  manager.stats.channels = res = res.reduce((a, b) => a + b);
  manager.log('FETCHED CHANNELS', res);
}

const fetchUsers = async () => {
  let res = await manager.broadcastEval('this.guilds.map(g => g.memberCount).reduce((a, b) => a + b)');
  manager.stats.users = res = res.reduce((a, b) => a + b);
  manager.log('FETCHED USERS', res);
}

const fetchAll = async () => {
  await fetchGuilds();
  await fetchChannels();
  await fetchUsers();
}

setInterval(() => {
  manager.stats.shards = manager.shards.size;
  backend.sse.broadcast('stats', JSON.stringify(manager.stats));
}, 2000);

process.on('unhandledRejection', (reason, promise) => {
  manager.log(reason);
});
