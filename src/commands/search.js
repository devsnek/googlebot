const superagent = require('superagent');
const cheerio = require('cheerio');
const url = require('url');

const fallback = async (message, args, safe, client) => {
  let sUrl = `https://www.google.com/search?safe=${safe}&q=${encodeURI(args)}`;
  superagent.get(sUrl).end((err, res) => {
    if (err) client.error(err);
    const $ = cheerio.load(res.text);
    let href = $('.r').first().find('a').first().attr('href');
    if (!href) return message.edit('`No results found!`');
    if (href.indexOf('/url?q=') !== -1) {
      href = href.replace('/url?q=', '');
      href = href.slice(0, href.indexOf('&sa'));
    };
    try {
      let result = url.parse(href.toString());
      if (result.protocol === null) {
        return message.edit('`No results found!`');
      }
      result = `${result.protocol}${result.slashes ? '//' : ''}${result.host}${result.port ? result.port : ''}${result.pathname ? result.pathname : ''}`
      message.edit(result).catch(() => message.edit('`No results found!`'));
    } catch (err) {
      message.edit('`No results found!`');
    }
  });
}

module.exports = {
  main: async (message, msg) => {
    const client = message.client;
    const args = message.content.trimLeft();
    if (!msg) msg = await message.channel.send('`Searching...`');
    const key = client.util.keys.nextKey;
    const s = await client.rethink.fetchGuild(message.guild.id);
    const safeSetting = s ? {1: 'off', 2: 'medium', 3: 'high'}[parseInt(s.nsfw)] : 'medium';
    const safe = message.channel.name.includes('nsfw') ? 'off' : safeSetting;
    client.log('Search:', message.guild.name, message.guild.id, '|', args, '|', safe, '|', key, client.util.keys.last);
    let url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${client.config.google.cx}&safe=${safe}&q=${encodeURI(args)}`;
    superagent.get(url).end((err, res) => {
      if (err) return fallback(msg, args, safe, client);
      if (res.body.queries.request[0].totalResults === '0') return msg.edit('`No results found!`');
      msg.edit(res.body.items[0].link).catch(() => {
        fallback(msg, args, safe, client);
      });
    });
  },
  args: '<query>',
  help: 'Search billions of web pages',
  catagory: 'general'
};
