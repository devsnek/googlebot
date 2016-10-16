const TagManager = require('tagmanager');
const tags = new TagManager();

module.exports = {
  main: async (bot, msg, settings) => {
    msg.channel.sendMessage(tags.keys().sort().join(', ').substring(0, 2000));
  },
  args: '',
  catagory: 'general',
  help: 'List all tags'
}
