'use strict';

const Sherlock = require('sherlockjs');

module.exports = {
  main: function(bot, msg) {
    let s = Sherlock.parse(msg.content);
    msg.channel.sendMessage(s.eventTitle + ": " + (s.startDate.getTime() - Date.now())/1000);
    setTimeout(function() {
      msg.channel.sendMessage(`${msg.author.mention()} **REMINDER:** ${s.eventTitle}`);
    }, s.startDate.getTime() - Date.now());
  }
}
