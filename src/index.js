const Client = require('./GooglebotClient');
const Frontend = require('./frontend');

const client = new Client();
const frontend = new Frontend(client);

client.on('error', client.error.bind(null, '[CLIENT ERROR]'));
client.ws.on('close', (event, shardID) => client.error('[WS CLOSE]', event.code, shardID));

client.on('shardReady', (id) => client.log(`[SHARD ${id} READY]`));

frontend.listen(1337);

function sseStats(sender = frontend.sse.broadcast) {
  sender('stats', JSON.stringify({
    guilds: client.guilds.size,
    channels: client.channels.size,
    users: client.users.size,
    shards: client.ws.shardCount,
  }));
}

frontend.sse.on('connection', () => sseStats(client.send));

client.login().then(() => {
  setInterval(sseStats, 2000);
});

process.on('unhandledRejection', (reason) => client.error(reason));
