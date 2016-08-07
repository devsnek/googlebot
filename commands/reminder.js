'use strict';

const Sherlock = require('sherlockjs');

module.exports = {
  main: function(bot, msg) {
    let s = Sherlock.parse(msg.content);
    bot.sendMessage(msg, s.eventTitle + ": " + (s.startDate.getTime() - Date.now())/1000);
    setTimeout(function() {
        bot.sendMessage(msg.channel.id, `${msg.author.mention()} **${s.eventTitle}**`);
    }, s.startDate.getTime() - Date.now());
  }
}
