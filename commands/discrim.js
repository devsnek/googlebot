module.exports = {
  main: async (message) => {
    const client = message.client;
    let res = await client.shard.broadcastEval(`this.users.filter(x => x.discriminator === "${message.content}").map(u => u.id)`);
    res = [].concat(...res);
    res = res.filter((e, i, a) => i === a.indexOf(e));
    res = await Promise.all(res.map(u => client.fetchUser(u)));
    message.channel.sendMessage(`**${res.length} users with discrim ${message.content}:**\n${res.map(u => u.username).join(', ')}`)
  },
  hide: true
}
