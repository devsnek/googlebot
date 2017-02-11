const superagent = require('superagent');
const querystring = require('querystring');

module.exports = {
  main: async (message, options) => {
    const client = message.client;
    if (message.content.trim() === '') return;
    const query = message.content
      .replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '')
      .split(' ')
      .map(x => encodeURIComponent(x))
      .join('+');
    client.log('KG: ', message.guild.name, message.guild.id, '|', query);
    const QUERY_PARAMS = {
      key: client.config.google.kgKey,
      limit: 1,
      indent: true,
      query,
    };
    const msg = await message.channel.send('**Searching...**');
    return superagent.get(`https://kgsearch.googleapis.com/v1/entities:search?${querystring.stringify(QUERY_PARAMS)}`)
      .then((res) => {
        let result = res.body.itemListElement[0];
        if (!result) return Promise.reject('NO RESULT');
        result = result.result;
        let types = result['@type'].map(t => t.replace(/([a-z])([A-Z])/g, '$1 $2'));
        if (types.length > 1) types = types.filter(t => t !== 'Thing');
        const title = `${result.name} ${types.length === 0 ? '' : `(${types.join(', ')})`}`;
        const LEARN_MORE_URL = result.detailedDescription.url.replace(/\(/, '%28').replace(/\)/, '%29');
        const description = `${result.detailedDescription.articleBody} [Learn More...](${LEARN_MORE_URL})`;
        return msg.edit({ embed: client.util.embed(result.detailedDescription.url, title, description) });
      })
      .catch((err) => {
        client.error(err);
        return client.commands.get('search').main(message, options, msg);
      });
  },
  hide: true,
};
