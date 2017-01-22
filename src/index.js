const Client = require('./GooglebotClient');
const Frontend = require('./frontend')

const client = new Client();
const frontend = new Frontend(client);

frontend.listen(1337);

function sseStats (sender = frontend.sse.broadcast) {
  sender('stats', JSON.stringify({
    guilds: client.guilds.size,
    channels: client.channels.size,
    users: client.users.size,
    shards: client.ws.shardCount
  }));
}

frontend.sse.on('connection', connection => sseStats(client.send));

client.login().then(() => {
  setInterval(sseStats, 2000);
});

process.on('unhandledRejection', (reason, promise) => client.error(reason));
