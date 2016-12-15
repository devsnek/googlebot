module.exports = (client) => {
  return async (event) => {
    const watched = await client.rethink.fetchWatched();
    const channel = client.channels.get(client.config.watching);
    if (watched.map(w => w.id).includes(event.user.id)) {
      channel.sendMessage(`**${event.type}**
${event.user.username}#${event.user.discriminator} (${event.user.id})
**${event.context}:** ${event.content}`);
    }
  }
}
