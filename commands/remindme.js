const Sherlock = require('sherlockjs');
const moment = require('moment');

module.exports = {
  main: async message => {
    let s = Sherlock.parse(message.content);
    let relative = s.startDate.getTime() - Date.now();
    s.eventTitle = s.eventTitle.replace(/^to ?/, '');
    message.channel.sendMessage(`I will remind you to ${s.eventTitle} ${moment().add(relative, 'ms').fromNow()}`);
    setTimeout(() => {
      let final = `**REMINDER:** ${s.eventTitle}`;
      message.author.sendMessage(final).catch(() => message.channel.sendMessage(`${message.author} ${final}`));
    }, relative);
  },
  hide: true
}
