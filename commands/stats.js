const toHHMMSS = seconds => {
  var secNum = parseInt(seconds, 10); // don't forget the second param
  var hours = Math.floor(secNum / 3600);
  var minutes = Math.floor((secNum - (hours * 3600)) / 60);
  seconds = secNum - (hours * 3600) - (minutes * 60);

  if (hours < 10) hours = '0' + hours;
  if (minutes < 10) minutes = '0' + minutes;
  if (seconds < 10) seconds = '0' + seconds;
  return hours + ':' + minutes + ':' + seconds;
}

module.exports = {
  main: async message => {
    const client = message.client;
    let final = `STATISTICS
• Mem Usage    : ${process.memoryUsage().heapUsed / 1000000} MB
• Uptime       : ${toHHMMSS(client.uptime / 1000)}
• Users        : ${client.config.totalUsers}
• Servers      : ${client.config.totalGuilds}
• Channels     : ${client.config.totalChannels}
• Discord.js   : v${require('../node_modules/discord.js/package.json').version}
• Shard        : ${Number(client.shard.id) + 1}/${client.shard.count}
`;
    message.channel.sendCode('xl', final);
  },
  hide: true
}
