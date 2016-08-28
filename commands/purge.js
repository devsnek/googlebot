"use strict";

module.exports = {
  main: function(bot, msg) {
    let count = parseInt(msg.content);
    msg.channel.getMessages({limit: 100}).then(messages => {
      messages = messages.array().filter(m => m.author.id === bot.user.id).slice(0, count+1);
      msg.channel.bulkDelete(messages);
    });
  },
  help: 'template'
};
