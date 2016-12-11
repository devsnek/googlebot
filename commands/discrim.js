module.exports = {
  main: async (message) => {
    const client = message.client;
    let res = await client.shard.broadcastEval(`this.users.filter(x => x.discriminator === "${message.content}").map(u => u.username)`);
    res = [].concat(...res);
    res = res.filter((e, i, a) => i === a.indexOf(e));
    message.channel.sendMessage(`**${res.length} users with discrim ${message.content}:**\n${res.join(', ')}`);
  },
  hide: true
}
