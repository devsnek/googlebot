module.exports = (client) => {
  return async (event) => {
    const watched = await client.rethink.fetchWatched();
    if (watched.map(w => w.id).includes(event.user.id)) {
      client.util.sendUnshardedMessage(client.config.watching,
`**${event.type}**
${event.user.username}#${event.user.discriminator} (${event.user.id})
**${event.context}:** ${event.content}`);
    }
  }
}
