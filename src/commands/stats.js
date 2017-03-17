const stripIndent = require('common-tags').stripIndent;

module.exports = {
  main: (message) => {
    const client = message.client;
    const eventCounter = client.eventCounter;
    const presencePercent = (((eventCounter.events.PRESENCE_UPDATE / eventCounter.total) * 100) || 0.00).toFixed(2);
    message.channel.send(stripIndent`
      **STATISTICS**
      **• Mem Usage:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
      **• Uptime:** ${client.util.toHHMMSS(client.uptime / 1000)}
      **• Users:** ${client.users.size.toLocaleString()}
      **• Channels:** ${client.channels.size.toLocaleString()}
      **• Guilds:** ${client.guilds.size.toLocaleString()}
      **• Library:** Discord.js v${require('discord.js').version}
      **• Shard:** ${Number(message.guild.shardID) + 1}/${client.ws.shardCount}

      ${presencePercent}% of ${eventCounter.total.toLocaleString()} total events are presence updates.
    `);
  },
  hide: true,
};
