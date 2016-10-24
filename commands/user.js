module.exports = {
  main: async message => {
    const user = await message.client.fetchUser(message.content);
    message.channel.sendMessage(JSON.stringify(user));
  },
  hide: true
}
