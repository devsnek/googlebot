const superagent = require('superagent');

module.exports = {
  main: async message => {
    const client = message.client;
    const args = message.content.replace(/(who|what|when|where) (was|is|were|are) /gi, '').split(' ').join('+');
    const msg = await message.channel.sendMessage('`Searching...`');
    client.log('KG: ', msg.guild.name, msg.guild.id, '|', args);
    const url = `https://kgsearch.googleapis.com/v1/entities:search?key=${client.config.google.kgKey}&limit=1&indent=True&query=${args}`;
    superagent.get(url).end((err, res) => {
      if (err) {
        client.error(err.stack);
        msg.delete();
        return client.commands.search.main(message);
      }
      const kg = res.body.itemListElement[0].result;
      const final = `**${kg.name} (${kg['@type'].filter(t => t !== 'Thing').map(t => t.replace(/([a-z])([A-Z])/g, '$1 $2')).join(', ')})**
${kg.detailedDescription.articleBody}
<${kg.detailedDescription.url}>`;
      msg.edit(final).catch(err => {
        client.error(err.stack);
        msg.delete();
        client.commands.search.main(message);
      });
    });
  },
  hide: true
};
