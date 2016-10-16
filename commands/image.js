const superagent = require('superagent');
const cheerio = require('cheerio');

const fallback = (message, args, safe, bot) => {
  let url = `https://www.google.com/search?tbm=isch&gs_l=img&safe=${safe}&q=${encodeURI(args)}`;
  superagent.get(url).end((err, res) => {
    if (err) bot.error(err);
    const $ = cheerio.load(res.text);
    const result = $('.images_table').find('img').first().attr('src');
    message.edit(result).catch(() => message.edit('`No results found!`'));
  });
}

module.exports = {
  main: async (bot, msg, settings) => {
    const args = msg.content.trimLeft();
    const message = await msg.channel.sendMessage('`Searching...`');
    const key = settings.KEYS[settings.lastKey + 1];
    const s = await settings.rethink(msg.guild.id);
    const safeSetting = s ? {1: 'off', 2: 'medium', 3: 'high'}[parseInt(s.nsfw)] : 'medium';
    const safe = msg.channel.name.includes('nsfw') ? 'off' : safeSetting;
    bot.log('Search:', msg.guild.name, msg.guild.id, '|', args, '|', safe, '|', key, settings.lastKey + 1);
    let url = `https://www.googleapis.com/customsearch/v1?searchType=image&key=${key}&cx=${settings.config.cx}&safe=${safe}&q=${encodeURI(args)}`;
    superagent.get(url).end((err, res) => {
      if (err) return fallback(message, args, safe, bot);
      message.edit(JSON.parse(res.text)['items'][0]['link']).catch(() => fallback(message, args, safe, bot));
    });
    settings.toBeDeleted.set(msg.id, message.id);
    settings.lastKey += 1;
    if (settings.lastKey + 1 >= settings.KEYS.length) settings.lastKey = 0;
  },
  args: '<query>',
  help: 'Search billions of web pages',
  catagory: 'general'
};
