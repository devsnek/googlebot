const reqEvt = (event) => require(`../events/${event}`);

module.exports = client => {
  client.on('ready', reqEvt('ready').bind(this, client));
  client.on('shardReady', reqEvt('ready').bind(this, client));
  client.on('message', reqEvt('message'));
  client.on('guildCreate', reqEvt('guildCreate'));
  client.on('guildDelete', reqEvt('guildDelete'));
};
