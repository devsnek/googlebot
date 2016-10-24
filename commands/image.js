const superagent = require('superagent');
const cheerio = require('cheerio');

const fallback = (message, args, safe, client) => {
  let url = `https://www.google.com/search?tbm=isch&gs_l=img&safe=${safe}&q=${encodeURI(args)}`;
  superagent.get(url).end((err, res) => {
    if (err) client.error(err);
    const $ = cheerio.load(res.text);
    const result = $('.images_table').find('img').first().attr('src');
    message.edit(result).catch(() => message.edit('`No results found!`'));
  });
}

module.exports = {
  main: async message => {
    const client = message.client;
    const args = message.content.trimLeft();
    const msg = await message.channel.sendMessage('`Searching...`');
    const key = client.keys.getKey()
    const s = await client.rethink.fetchGuild(message.guild);
    const safeSetting = s ? {1: 'off', 2: 'medium', 3: 'high'}[parseInt(s.nsfw)] : 'medium';
    const safe = message.channel.name.includes('nsfw') ? 'off' : safeSetting;
    client.log('Image:', message.guild.name, message.guild.id, '|', args, '|', safe, '|', key, client.keys.lastKey);
    let url = `https://www.googleapis.com/customsearch/v1?searchType=image&key=${key}&cx=${client.config.cxImg}&safe=${safe}&q=${encodeURI(args)}`;
    superagent.get(url).end((err, res) => {
      if (err) return fallback(msg, args, safe, client);
      try {
        msg.edit(res.body.items[0].link).catch(err => {
          fallback(msg, args, safe, client);
        });
      } catch (err) {
        fallback(msg, args, safe, client);
      }
    });
  },
  args: '<query>',
  help: 'Search billions of web pages',
  catagory: 'general'
};
