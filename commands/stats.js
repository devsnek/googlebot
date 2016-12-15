module.exports = {
  main: async message => {
    const client = message.client;
    const { users, channels, guilds } = await client.util.fetchStats();
    const memUsage = (await client.shard.broadcastEval('process.memoryUsage().heapUsed / 1024 / 1024')).reduce((a, b) => a + b);
    let final = `STATISTICS
• Mem Usage    : ${memUsage.toFixed(2)} MB
• Uptime       : ${client.util.toHHMMSS(client.uptime / 1000)}
• Users        : ${users.toLocaleString()}
• Channels     : ${channels.toLocaleString()}
• Guilds       : ${guilds.toLocaleString()}
• Discord.js   : v${require('../node_modules/discord.js/package.json').version}
• Shard        : ${Number(client.shard.id) + 1}/${client.shard.count}`;
    message.channel.sendCode('xl', final);
  },
  hide: true
}
