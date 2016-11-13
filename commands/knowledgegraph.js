const superagent = require('superagent');

module.exports = {
  main: async message => {
    const client = message.client;
    const args = message.content.replace(/(who|what|when|where) (was|is|were|are) /gi, '');
    const msg = await message.channel.sendMessage('`Searching...`');
    client.log('KG: ', message.guild.name, message.guild.id, '|', args);
    const url = `https://kgsearch.googleapis.com/v1/entities:search?key=${client.config.google.kgKey}&limit=1&indent=True&query=${args.split(' ').join('+')}`;
    const res = await superagent.get(url);
    if (!res.body.itemListElement[0]) return client.commands.search.main(message, msg);
    const kg = res.body.itemListElement[0].result;
    if (!kg.detailedDescription) return client.commands.search.main(message, msg);
    const embed = {
      title: `${kg.name} (${kg['@type'].filter(t => t !== 'Thing').map(t => t.replace(/([a-z])([A-Z])/g, '$1 $2')).join(', ')})`,
      description: `${kg.detailedDescription.articleBody} [more...](${kg.detailedDescription.url})

[Help keep Googlebot running](https://www.change.org/p/google-inc-help-googlebot-not-die/)
[Donate to keep Googlebot alive](https://patreon.com/guscaplan)`,
      url: kg.detailedDescription.url,
      timestamp: new Date(),
      footer: {
        text: 'Powered by Google',
        icon_url: 'https://google.com/favicon.ico'
      }
    }
    msg.edit('', { embed }).catch(err => {
      client.error(err.stack);
      client.commands.search.main(message, msg);
    });
  },
  hide: true
};
