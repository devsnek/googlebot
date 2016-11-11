const superagent = require('superagent');

const fallback = (client, msg, message) => {
  msg.delete();
  client.commands.search.main(message);
}

module.exports = {
  main: async message => {
    const client = message.client;
    const args = message.content.replace(/(who|what|when|where) (was|is|were|are) /gi, '').split(' ').join('+');
    const msg = await message.channel.sendMessage('`Searching...`');
    client.log('KG: ', msg.guild.name, msg.guild.id, '|', args);
    const url = `https://kgsearch.googleapis.com/v1/entities:search?key=${client.config.google.kgKey}&limit=1&indent=True&query=${args}`;
    const res = await superagent.get(url);
    if (!res.body.itemListElement[0]) return fallback(client, msg, message);
    const kg = res.body.itemListElement[0].result;
    if (!kg.detailedDescription) return fallback(client, msg, message);
    const final = `**${kg.name} (${kg['@type'].filter(t => t !== 'Thing').map(t => t.replace(/([a-z])([A-Z])/g, '$1 $2')).join(', ')})**
${kg.detailedDescription.articleBody}
<${kg.detailedDescription.url}>`;
    msg.edit(final).catch(err => {
      client.error(err.stack);
      fallback(client, msg, message);
    });
  },
  hide: true
};
