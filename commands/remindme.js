const Sherlock = require('sherlockjs');
const moment = require('moment');

module.exports = {
  main: async (bot, msg) => {
    let s = Sherlock.parse(msg.content);
    let relative = s.startDate.getTime() - Date.now();
    msg.channel.sendMessage(`I will remind you to ${s.eventTitle} ${moment().add(relative, 'ms').fromNow()}`);
    setTimeout(() => {
      msg.channel.sendMessage(`${msg.author} **REMINDER:** ${s.eventTitle}`);
    }, relative);
  },
  hide: true
}
