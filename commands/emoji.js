const unirest = require('unirest');

module.exports = {
  main: (bot, msg) => {
    unirest.get('http://emoji.getdango.com/api/emoji?q=' + msg.content)
    .end(res => {
      let final = res.body.results.map(r => r.text).slice(0, 7).join(' ');
      msg.channel.sendMessage(final);
    });
  },
  hide: true
};
