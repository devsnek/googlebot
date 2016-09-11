const Sherlock = require('sherlockjs');

module.exports = {
  main: (bot, msg) => {
    let s = Sherlock.parse(msg.content);
    msg.channel.sendMessage(s.eventTitle + ': ' + (s.startDate.getTime() - Date.now()) / 1000);
    setTimeout(() => {
      msg.channel.sendMessage(`${msg.author.mention()} **REMINDER:** ${s.eventTitle}`);
    }, s.startDate.getTime() - Date.now());
  },
  hide: true
}
