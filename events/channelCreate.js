module.exports = channel => {
  const client = channel.client;
  client.sendIpc('fetchGuilds');
}
