const TagManager = require('tagmanager');
const tags = new TagManager();

module.exports = {
  main: (bot, msg, settings) => {
    msg.channel.sendMessage(tags.keys().join(', ').substring(0, 2000));
  },
  hide: true
}
