const axios = require('axios');

module.exports = {
  main: async message => {
    let url = 'https://www.googleapis.com/urlshortener/v1/url?key=' + message.client.config.google.shortenKey;
    const res = await axios.post(url, {headers: {'Content-Type': 'application/json'}}, {'longUrl': message.content});
    message.channel.sendMessage(res.data.id);
  },
  help: 'Shorten a url using goo.gl',
  args: '<url>',
  catagory: 'general'
}
