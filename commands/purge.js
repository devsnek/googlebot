module.exports = {
  main: (bot, msg) => {
    let count = parseInt(msg.content) || 5;
    msg.channel.fetchMessages({limit: 100}).then(messages => {
      messages = messages.array().filter(m => m.author.id === bot.user.id).slice(0, count + 1);
      msg.channel.bulkDelete(messages);
    });
  },
  help: 'deletes messages from channel, default 5',
  args: '<count>',
  catagory: 'util'
};
