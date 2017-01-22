module.exports = {
  main: async (message) => {
    const client = message.client;
    if (message.content === 'top') {
      const count = {};
      for (const d of client.users.map(u => u.discriminator)) count[d] = { d, c: (count[d] ? count[d].c : 0) + 1 };
      const final = Object.values(count).sort((a, b) => a.c - b.c).slice(0, 10).map(f => `**${f.d}:** ${f.c}`).join('\n');
      message.channel.send(final);
    } else {
      const users = client.users.filter(u => u.discriminator === message.content).map(u => u.username).sort();
      message.channel.send(`**${users.length} users with discrim ${message.content}:**\n${users.join(', ')}`);
    }
  },
  hide: true
}
