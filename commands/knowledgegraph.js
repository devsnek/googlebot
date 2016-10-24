const superagent = require('superagent');

module.exports = {
  main: async (bot, msg, settings) => {
    const args = msg.content.replace(/(who|what|when|where) (was|is|were|are) /gi, '').split(' ').join('+');
    const message = await msg.channel.sendMessage('`Searching...`');
    bot.log('KG: ', msg.guild.name, msg.guild.id, '|', args);
    const url = `https://kgsearch.googleapis.com/v1/entities:search?key=${settings.config.kgKey}&limit=1&indent=True&query=${args}`;
    superagent.get(url).end((err, res) => {
      if (err) {
        bot.error(err);
        message.delete();
        return settings.commands.search.main(bot, msg, settings);
      }
      const kg = res.body.itemListElement[0].result;
      const final = `**${kg.name} (${kg['@type'].join(', ')})**
${kg.detailedDescription.articleBody}
<${kg.detailedDescription.url}>`;
      message.edit(final).catch(err => {
        bot.error(err);
        message.delete();
        settings.commands.search.main(bot, msg, settings);
      });
    });
  },
  hide: true
};
