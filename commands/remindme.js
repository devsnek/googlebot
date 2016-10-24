const Sherlock = require('sherlockjs');
const moment = require('moment');

module.exports = {
  main: async message => {
    let s = Sherlock.parse(message.content);
    let relative = s.startDate.getTime() - Date.now();
    message.channel.sendMessage(`I will remind you to ${s.eventTitle} ${moment().add(relative, 'ms').fromNow()}`);
    setTimeout(() => {
      message.channel.sendMessage(`${message.author} **REMINDER:** ${s.eventTitle}`);
    }, relative);
  },
  hide: true
}
