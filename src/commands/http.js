const superagent = require('superagent');
const cheerio = require('cheerio');

module.exports = {
  main: (message) => {
    superagent.get(`https://httpstatuses.com/${message.content}`)
      .then((res) => cheerio.load(res.text))
      .then(($) => {
        const container = $('.code.container')[0];
        return {
          title: container.children[3].children[0].children[0].data + container.children[3].children[1].data,
          description: container.children[4].children[0].data,
          url: `https://httpstatuses.com/${message.content}`,
        };
      })
      .then((embed) => message.channel.send({ embed }));
  },
  help: 'check an http status code',
  args: '<code>',
  category: 'util',
};
