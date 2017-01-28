const superagent = require('superagent');

module.exports = {
  main: async message => {
    const res = await superagent.get(`https://emoji.getdango.com/api/emoji?q=${message.content}`);
    let final = res.body.results.map(r => r.text).slice(0, 7).join(' ');
    message.channel.send(final);
  },
  hide: true,
};
