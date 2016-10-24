module.exports = message => {
  const client = message.client;
  if (!message.event) return;
  switch (message.event) {
    case 'guildsFetched': {
      client.config.totalGuilds = message.data;
      break;
    }
    case 'channelsFetched': {
      client.config.totalChannels = message.data;
      break;
    }
    case 'usersFetched': {
      client.config.totalUsers = message.data;
      break;
    }
    default:
      break;
  }
}
