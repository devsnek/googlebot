const superagent = require('superagent');
const cheerio = require('cheerio');

module.exports = {
  main: async (message) => {
    const res = await superagent.get(`https://httpstatuses.com/${message.content}`);
    const $ = cheerio.load(res.text);
    const container = $('.code.container')[0];
    const title = container.children[3].children[0].children[0].data + container.children[3].children[1].data;
    const description = container.children[4].children[0].data;
    const embed = {
      title,
      description,
      url: `https://httpstatuses.com/${message.content}`
    }
    message.channel.sendMessage('', { embed });
  },
  help: 'check an http status code',
  args: '<code>',
  category: 'util'
}
