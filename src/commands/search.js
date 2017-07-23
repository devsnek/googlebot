const google = require('../util/google');

module.exports = function search(message) {
  google.search(message.content, message.channel.nsfw)
    .then((link) => {
      message.reply(link || 'No results found', { bold: !link });
    });
};
