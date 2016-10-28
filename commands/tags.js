const TagManager = require('tagmanager');
const tagManager = new TagManager();

module.exports = {
  main: async message => {
    const tags = tagManager.keys().sort().join(', ').substring(0, 2000);
    message.channel.sendMessage(tags.length ? tags : 'No tags!');
  },
  args: '',
  catagory: 'general',
  help: 'List all tags'
}
