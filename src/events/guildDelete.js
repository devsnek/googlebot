module.exports = guild => {
  const client = guild.client;
  client.rethink.vacateGuild(guild);
};
