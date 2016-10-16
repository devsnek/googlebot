module.exports = {
  main: async (client, message, settings) => {
    const user = await client.fetchUser(message.content);
    message.channel.sendMessage(JSON.stringify(user));
  },
  hide: true
}
