module.exports = {
  main: message => {
    let count = parseInt(message.content) || 5;
    message.channel.fetchMessages({ limit: 100 })
      .then((messages) => messages.array().filter(m => m.author.id === message.client.user.id).slice(0, count + 1))
      .then((messages) => message.channel.bulkDelete(messages)
        .catch(() => messages.map(m => m.delete())));
  },
  help: 'deletes Googlebot\'s messages from channel, default 5',
  args: '<count>',
  catagory: 'util',
};
