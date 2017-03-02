const superagent = require('superagent');
const cheerio = require('cheerio');
const querystring = require('querystring');

module.exports = {
  main: async (message, msg) => {
    const client = message.client;
    if (!msg) msg = await message.channel.send('**Searching...**');
    const safe = message.channel.name.includes('nsfw') ? 'off' : 'medium';
    const QUERY_PARAMS = {
      key: client.util.keys.nextKey,
      cx: client.config.google.cx,
      safe,
      q: encodeURI(message.content),
    };
    client.log('Search:', message.guild.name, message.guild.id, '|', message.content, '|', safe);
    return superagent.get(`https://www.googleapis.com/customsearch/v1?${querystring.stringify(QUERY_PARAMS)}`)
      .then((res) => {
        if (res.body.queries.request[0].totalResults === '0') return Promise.reject(new Error('NO RESULTS'));
        return msg.edit(res.body.items[0].link);
      })
      .catch(() => {
        const SEARCH_URL = `https://www.google.com/search?safe=${safe}&q=${encodeURI(message.content)}`;
        return superagent.get(SEARCH_URL).then((res) => {
          const $ = cheerio.load(res.text);
          let href = $('.r').first().find('a').first().attr('href');
          if (!href) return Promise.reject(new Error('NO RESULTS'));
          href = querystring.parse(href.replace('/url?', ''));
          return msg.edit(href.q);
        });
      })
      .catch((err) => {
        client.error(err);
        msg.edit('**No Results Found!**');
      });
  },
  args: '<query>',
  help: 'Search billions of web pages',
  catagory: 'general',
};
