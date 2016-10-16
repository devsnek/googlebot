const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  main: async (bot, msg, settings) => {
    const res = axios.get(`http://time.is/${msg.content.replace(/^in/, '')}`)
    const $ = cheerio.load(res.body);
    msg.channel.sendMessage(`${$('#msgdiv > h1').text()} is ${$('#dd').text()}, ${$('#twd').text()}`);
  },
  help: 'Get time of location',
  args: '<location>',
  catagory: 'general'
}
