module.exports = async guild => {
  const client = guild.client;

  const hasGuild = await client.rethink.hasGuild(guild);

  client.log('NEW GUILD', hasGuild);

  if (hasGuild) {
    client.rethink.activateGuild(guild);
  } else {
    guild.defaultChannel.sendMessage(`${guild.owner} ${client.messages.welcome}`).catch(client.error);
    client.rethink.createGuild(guild);
  }
}
