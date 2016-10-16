const axios = require('axios');

module.exports = {
  main: async (bot, msg) => {
    const res = await axios.get('http://emoji.getdango.com/api/emoji?q=' + msg.content)
    let final = res.body.results.map(r => r.text).slice(0, 7).join(' ');
    msg.channel.sendMessage(final);
  },
  hide: true
};
