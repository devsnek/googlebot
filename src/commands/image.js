const google = require('../util/google');

module.exports = function image(message) {
  google.image(message.content, message.channel && message.channel.nsfw)
    .then((link) => {
      message.reply(link || 'No results found', { bold: !link });
    });
};
