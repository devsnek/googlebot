const superagent = require('superagent');

module.exports = {
  main: async message => {
    const res = await superagent.get('http://emoji.getdango.com/api/emoji?q=' + message.content)
    let final = res.body.results.map(r => r.text).slice(0, 7).join(' ');
    message.channel.sendMessage(final);
  },
  hide: true
};
