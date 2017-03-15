const Client = require('./GooglebotClient');
const Frontend = require('./frontend');

const client = new Client();
const frontend = new Frontend(client);

client.on('error', client.error.bind(null, '[CLIENT ERROR]'));
client.ws.on('close', (event, shardID) => client.error('[WS CLOSE]', event.code, shardID));

frontend.listen(1337);

function generateSSEStats() {
  return JSON.stringify({
    guilds: client.guilds.size,
    channels: client.channels.size,
    users: client.users.size,
    shards: client.ws.shardCount,
  });
}

frontend.sse.on('connection', (c) => c.send(generateSSEStats()));

client.login().then(() => {
  setInterval(() => {
    frontend.sse.broadcast(generateSSEStats());
  }, 2000);
});

process.on('unhandledRejection', (reason, promise) => {
  client.raven.captureException(reason, { extra: { promise } });
  client.error(promise, reason);
});
