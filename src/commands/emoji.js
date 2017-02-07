const superagent = require('superagent');

module.exports = {
  main: message => {
    superagent.get(`https://emoji.getdango.com/api/emoji?q=${message.content}`)
      .then((res) => res.body.results.map(r => r.text).slice(0, 7).join(' '))
      .then((final) => message.channel.send(final));
  },
  hide: true,
};
