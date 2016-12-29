const Sherlock = require('sherlockjs');
const moment = require('moment');

module.exports = {
  main: async message => {
    const s = Sherlock.parse(message.content);
    const relative = s.startDate.getTime() - Date.now();
    s.eventTitle = s.eventTitle.replace(/^me to ?|^me ?|^to ?/, '');
    message.channel.send(`I will remind you to ${s.eventTitle} ${moment().add(relative, 'ms').fromNow()}.`);
    setTimeout(() => {
      let final = `**REMINDER:** ${s.eventTitle}`;
      message.author.send(final).catch(() => message.channel.send(`${message.author} ${final}`));
    }, relative);
  },
  hide: true
}
