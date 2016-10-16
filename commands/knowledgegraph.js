const request = require('superagent');

module.exports = {
  main: (bot, msg, settings) => {
    var args = msg.content;
    args = args.replace(/(who|what|when|where) (was|is|were|are) /gi, '');
    msg.channel.sendMessage('`Searching...`').then(message => {
      bot.log('KG: ', msg.guild.name, msg.guild.id, '|', args);
      var url = `https://kgsearch.googleapis.com/v1/entities:search?key=${settings.config.kgKey}&limit=1&indent=True&query=${args.split(' ').join('+')}`;
      request.get(url).end((err, res) => {
        try {
          if (err) {
            bot.error(err);
            message.delete();
            return settings.commands.search.main(bot, msg, settings);
          }
          var kg = res.body.itemListElement[0].result;
          let final = `**${kg.name} (${kg['@type'].join(', ')})**
${kg.detailedDescription.articleBody}
<${kg.detailedDescription.url}>`;
          message.edit(final).catch(err => {
            bot.error(err);
            message.delete();
            settings.commands.search.main(bot, msg, settings);
          });
        } catch (err) {
          bot.error(err);
          message.delete();
          return settings.commands.search.main(bot, msg, settings);
        }
      });
    });
  },
  hide: true
};
