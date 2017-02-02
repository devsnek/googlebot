const superagent = require('superagent');
const cheerio = require('cheerio');
const querystring = require('querystring');

module.exports = {
  main: async (message) => {
    const client = message.client;
    const msg = await message.channel.send('**Searching...**');
    const guild = await client.rethink.fetchGuild(message.guild.id);
    const safe = message.channel.name.includes('nsfw') ? 'off' : guild ? { 1: 'off', 2: 'medium', 3: 'high' }[parseInt(guild.nsfw)] : 'medium';
    const QUERY_PARAMS = {
      searchType: 'image',
      key: client.util.keys.nextKey,
      cx: client.config.cxImg,
      safe,
      q: encodeURI(message.content),
    };
    superagent.get(`https://www.googleapis.com/customsearch/v1?${querystring.stringify(QUERY_PARAMS)}`)
      .then((res) => msg.edit(res.body.items[0].link))
      .catch(() =>
        superagent.get(`https://www.google.com/search?tbm=isch&gs_l=img&safe=${safe}&q=${encodeURI(message.content)}`)
          .then((res) => {
            const $ = cheerio.load(res.text);
            const result = $('.images_table').find('img').first().attr('src');
            return msg.edit(result);
          })
      ).catch((err) => {
        client.error(err);
        msg.edit('**No Results Found**');
      });
  },
  args: '<query>',
  help: 'Search billions of web pages',
  catagory: 'general',
};
