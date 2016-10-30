module.exports = async guild => {
  const client = guild.client;

  if (await client.rethink.hasGuild(guild)) {
    client.rethink.activateGuild(guild);
  } else {
    guild.defaultChannel.sendMessage(client.messages.welcome);
    client.rethink.createGuild(guild);
  }

  client.sendIpc('fetchGuilds');
}
