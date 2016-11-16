module.exports = {
  main: async message => {
    const client = message.client;
    const { users, channels, guilds } = await client.util.fetchStats();
    let final = `STATISTICS
• Mem Usage    : ${process.memoryUsage().heapUsed / 1000000} MB
• Uptime       : ${client.util.toHHMMSS(client.uptime / 1000)}
• Users        : ${users}
• Channels     : ${channels}
• Guilds       : ${guilds}
• Discord.js   : v${require('../node_modules/discord.js/package.json').version}
• Shard        : ${Number(client.shard.id) + 1}/${client.shard.count}`;
    message.channel.sendCode('xl', final);
  },
  hide: true
}
