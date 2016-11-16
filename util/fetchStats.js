module.exports = (client) => {
  return async () => {
    const users = (await client.shard.broadcastEval('this.guilds.map(g => g.memberCount).reduce((a, b) => a + b)')).reduce((a, b) => a + b);
    const channels = (await client.shard.broadcastEval('this.channels.size')).reduce((a, b) => a + b);
    const guilds = (await client.shard.broadcastEval('this.guilds.size')).reduce((a, b) => a + b);
    return { users, channels, guilds };
  }
}
