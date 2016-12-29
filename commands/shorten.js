const superagent = require('superagent');

module.exports = {
  main: async message => {
    let url = 'https://www.googleapis.com/urlshortener/v1/url?key=' + message.client.config.google.shortenKey;
    const res = await superagent.post(url).set({'Content-Type': 'application/json'}).send({'longUrl': message.content});
    message.channel.send(res.body.id);
  },
  help: 'Shorten a url using goo.gl',
  args: '<url>',
  catagory: 'general'
}
