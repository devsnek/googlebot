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
      message.edit(decodeURIComponent(result)).catch(() => message.edit('`No results found!`'));
    } catch (err) {
      message.edit('`No results found!`');
    }
  });
}

module.exports = {
  main: async message => {
    const client = message.client;
    const args = message.content.trimLeft();
    const msg = await message.channel.sendMessage('`Searching...`');
    const key = client.keys.getKey();
    const s = await client.rethink.fetchGuild(msg.guild.id);
    const safeSetting = s ? {1: 'off', 2: 'medium', 3: 'high'}[parseInt(s.nsfw)] : 'medium';
    const safe = msg.channel.name.includes('nsfw') ? 'off' : safeSetting;
    client.log('Search:', msg.guild.name, msg.guild.id, '|', args, '|', safe, '|', key, client.keys.lastKey);
    let url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${client.config.google.cx}&safe=${safe}&q=${encodeURI(args)}`;
    superagent.get(url).end((err, res) => {
      if (err) return fallback(msg, args, safe, client);
      if (res.body.queries.request[0].totalResults === '0') return msg.edit('`No results found!`');
      msg.edit(res.body.items[0].link).catch(err => {
        if (err) {
          return fallback(msg, args, safe, client);
        }
      });
    });
  },
  args: '<query>',
  help: 'Search billions of web pages',
  catagory: 'general'
};
