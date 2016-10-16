module.exports = {
  main: async (bot, msg) => {
    let count = parseInt(msg.content) || 5;
    let messages = await msg.channel.fetchMessages({limit: 100})
    messages = messages.array().filter(m => m.author.id === bot.user.id).slice(0, count + 1);
    msg.channel.bulkDelete(messages);
  },
  help: 'deletes messages from channel, default 5',
  args: '<count>',
  catagory: 'util'
};
