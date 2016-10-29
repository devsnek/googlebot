module.exports = {
  main: async message => {
    let count = parseInt(message.content) || 5;
    let messages = await message.channel.fetchMessages({limit: 100})
    messages = messages.array().filter(m => m.author.id === message.client.user.id).slice(0, count + 1);
    try {
      await message.channel.bulkDelete(messages);
    } catch (err) {
      messages.map(m => m.delete());
    }
  },
  help: 'deletes messages from channel, default 5',
  args: '<count>',
  catagory: 'util'
};
