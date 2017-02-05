module.exports = async guild => {
  const client = guild.client;
  client.log('NEW GUILD', guild.name, guild.id);
  guild.defaultChannel.sendMessage(`${guild.owner} ${client.messages.welcome}`).catch(client.error);
};
