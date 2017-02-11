const superagent = require('superagent');
const cheerio = require('cheerio');

module.exports = {
  main: async (message) => {
    const msg = await message.channel.send('**Loading...**');
    superagent.get(`http://time.is/${message.content.replace(/^in/, '')}`)
      .then((res) => cheerio.load(res.text))
      .then(($) => `${$('#msgdiv > h1').text()} is ${$('#dd').text()}, ${$('#twd').text()}`)
      .then((content) => msg.edit(content));
  },
  help: 'Get time of location',
  args: '<location>',
  catagory: 'general',
};
