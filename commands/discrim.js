module.exports = {
  main: async (message) => {
    const client = message.client;
    if (message.content === 'top') {
      let res = await client.shard.broadcastEval('this.users.map(u => u.discriminator)');
      res = [].concat(...res);
      let count = {};
      for (const d of res) count[d] = { d, c: (count[d] ? count[d].c : 0) + 1 };
      let final = Object.values(count).sort((a, b) => {
        if (a.c === b.c) return parseInt(a.d) < parseInt(b.d);
        else return a.c < b.c;
      });
      message.channel.send(final.slice(0, 10).map(f => `**${f.d}:** ${f.c}`).join('\n'));
    } else {
      let res = await client.shard.broadcastEval(`this.users.filter(x => x.discriminator === "${message.content}").map(u => u.username)`);
      res = [].concat(...res);
      res = res.filter((e, i, a) => i === a.indexOf(e));
      message.channel.send(`**${res.length} users with discrim ${message.content}:**\n${res.join(', ')}`);
    }
  },
  hide: true
}
