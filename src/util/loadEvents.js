const reqEvt = (event) => require(`../events/${event}`);

module.exports = client => {
  client.on('ready', reqEvt('ready').bind(this, client));
  client.on('disconnect', reqEvt('disconnect').bind(this, client));
  client.on('message', reqEvt('message'));
  client.on('guildCreate', reqEvt('guildCreate'));
  client.on('guildDelete', reqEvt('guildDelete'));
  client.on('channelCreate', reqEvt('channelCreate'));
  client.on('channelDelete', reqEvt('channelDelete'));
  client.on('guildMemberAdd', reqEvt('guildMemberAdd'));
  client.on('guildMemberRemove', reqEvt('guildMemberRemove'));
};
