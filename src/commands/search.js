const google = require('../util/google');

module.exports = function search(message) {
  google.search(message.content, message.channel.nsfw)
    .then(({ card, results }) => {
      if (card) {
        message.reply(card);
      } else if (results.length) {
        const links = results.map((r) => r.link);
        message.reply(`${links[0]}

**See Also:**
${links.slice(1, 3).map((l) => `<${l}>`).join('\n')}`.trim(), { bold: false });
      } else {
        message.reply('No results found');
      }
    });
};
