const axios = require('axios');

module.exports = {
  main: async message => {
    const res = await axios.get('http://emoji.getdango.com/api/emoji?q=' + message.content)
    let final = res.data.results.map(r => r.text).slice(0, 7).join(' ');
    message.channel.sendMessage(final);
  },
  hide: true
};
