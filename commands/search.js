const superagent = require('superagent');
const cheerio = require('cheerio');
const querystring = require('querystring');

const fallback = async (message, query, client) => {
  let url = `https://www.google.com/search?safe=${safe}&q=${encodeURI(args)}`;
  superagent.get(url).end((err, res) => {
    if (err) client.error(err);
    const $ = cheerio.load(res.text);
    const href = $('.r').first().find('a').first().attr('href');
    const result = Object.keys(querystring.parse(href.substr(7, href.length)))[0];
    if (result !== '?q') message.edit(result).catch(() => message.edit('`No results found!`'));
    else message.edit('`No results found!`');
  });
}

module.exports = {
  main: async (client, msg, settings) => {
    const args = msg.content.trimLeft();
    const message = await msg.channel.sendMessage('`Searching...`');
    const key = settings.KEYS[settings.lastKey + 1];
    const s = await settings.rethink(msg.guild.id);
    const safeSetting = s ? {1: 'off', 2: 'medium', 3: 'high'}[parseInt(s.nsfw)] : 'medium';
    const safe = msg.channel.name.includes('nsfw') ? 'off' : safeSetting;
    client.log('Search:', msg.guild.name, msg.guild.id, '|', args, '|', safe, '|', key, settings.lastKey + 1);
    let url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${settings.config.cx}&safe=${safe}&q=${encodeURI(args)}`;
    superagent.get(url).end((err, res) => {
      if (err) {
        client.error(err);
        return fallback(message, args, client);
      }
      message.edit(JSON.parse(res.text)['items'][0]['link']).catch(err => {
        if (err) {
          client.error(err);
          return fallback(message, args, client);
        }
      });
    });
    settings.toBeDeleted.set(msg.id, message.id);
    settings.lastKey += 1;
    if (settings.lastKey + 1 >= settings.KEYS.length) settings.lastKey = 0;
  },
  args: '<query>',
  help: 'Search billions of web pages',
  catagory: 'general'
};
