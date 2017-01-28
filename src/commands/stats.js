module.exports = {
  main: async message => {
    const client = message.client;
    let final = `**STATISTICS**
**• Mem Usage:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
**• Uptime:** ${client.util.toHHMMSS(client.uptime / 1000)}
**• Users:** ${client.users.size.toLocaleString()}
**• Channels:** ${client.channels.size.toLocaleString()}
**• Guilds:** ${client.guilds.size.toLocaleString()}
**• Library:** Discord.js v${require('../node_modules/discord.js/package.json').version}
**• Shard:** ${Number(message.guild.shardID) + 1}/${client.ws.shardCount}`;
    message.channel.send(final);
  },
  hide: true,
};
