const TagManager = require('tagmanager');
const tags = new TagManager();

module.exports = {
  main: (bot, msg, settings) => {
    if (msg.content.startsWith('create')) {
      let name = msg.content.split(' ')[1];
      if (tags.exists(name)) return msg.channel.sendMessage('That tag already exists!');
      let content = msg.content.split(' ').splice(2).join(' ');
      tags.set(name, content, {author: msg.author.id});
      return msg.channel.sendMessage(`Successfully created tag **${name}**!`);
    } else if (msg.content.startsWith('remove')) {
      let name = msg.content.split(' ')[1];
      if (!tags.exists(name)) return msg.channel.sendMessage('That tag does not exist');
      if (tags.get(name).meta.author === msg.author.id) {
        tags.remove(name);
        return msg.channel.sendMessage(`Successfully removed tag **${name}**!`);
      } else {
        return msg.channel.sendMessage('That is not your tag!');
      }
    } else {
      let replace = {
        'name': msg.author.username,
        'channel': msg.channel.toString(),
        'guild': msg.guild.name
      }
      let functions = {
        'random': (min, max) => Math.floor(Math.random() * parseInt(max)) + parseInt(min)
      }
      let out = tags.get(msg.content, replace, functions);
      bot.fetchUser(out.meta.author).then(user => {
        msg.channel.sendMessage(`**${msg.content}** (${user.username}#${user.discriminator})\n${out.data}`).catch(bot.error);
      }).catch(bot.error);
    }
  },
  hide: true
}
