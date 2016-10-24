const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  main: async message => {
    const res = await axios.get(`http://time.is/${message.content.replace(/^in/, '')}`)
    const $ = cheerio.load(res.data);
    message.channel.sendMessage(`${$('#msgdiv > h1').text()} is ${$('#dd').text()}, ${$('#twd').text()}`);
  },
  help: 'Get time of location',
  args: '<location>',
  catagory: 'general'
}
