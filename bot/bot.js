const Discord = require('discord.js');
const KeyManager = require('../util/KeyManager');

const client = new Discord.Client({
  autoReconnect: true,
  messageCacheMaxSize: 1,
  disableEveryone: true,
  // api_request_method: 'burst',
  disabledEvents: [
    'PRESENCE_UPDATE',
    'TYPING_START',
    'TYPING_STOP',
    'VOICE_STATE_UPDATE',
    'FRIEND_ADD',
    'FRIEND_REMOVE'
  ]
});

// ALL THE THINGS THAT NEED TO BE ATTACHED TO THE CLIENT //
client.rethink = require('../util/rethink');

client.sendIpc = (event, data) => process.send({ event, data, id: client.shard.id });
client.config = require('../config.json');

require('../util/attachDebugMethods')(client);
require('../util/loadAssets')(client, __dirname);

client.util = {
  keys: new KeyManager(),
  embed: require('../util/embed'),
  fetchStats: require('../util/fetchStats')(client),
  isStaff: require('../util/isStaff'),
  toHHMMSS: require('../util/toHHMMSS'),
  pad: require('../util/pad'),
  watching: require('../util/watching')(client),
  sendUnshardedMessage: require('../util/sendUnshardedMessage')(client)
}

// EVENTS //
require('../util/loadEvents')(client);

// LETS GOOOOOO //
client.login();

client.sendIpc('alive', client.shard.id);

// PROCESS HANDLERS //
process.on('message', message => {
  message.client = client;
  require('../events/processMessage')(message);
});

process.on('SIGHUP', () => process.exit(0));

process.on('unhandledRejection', (reason, promise) => client.error(reason));
