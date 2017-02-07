const superagent = require('superagent');
const cheerio = require('cheerio');

module.exports = {
  main: (message) => {
    superagent.get(`http://time.is/${message.content.replace(/^in/, '')}`)
      .then((res) => cheerio.load(res.text))
      .then(($) => `${$('#msgdiv > h1').text()} is ${$('#dd').text()}, ${$('#twd').text()}`)
      .then((content) => message.channel.send(content));
  },
  help: 'Get time of location',
  args: '<location>',
  catagory: 'general',
};
