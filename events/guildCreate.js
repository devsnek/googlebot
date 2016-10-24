module.exports = guild => {
  const client = guild.client;
  client.rethink.createGuild(guild);
  client.sendIpc('fetchGuilds');
}
