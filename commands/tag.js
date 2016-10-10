const TagManager = require('tagmanager');

const tags = new TagManager();

module.exports = {
  main: (bot, msg, settings) => {
    if (msg.cleanContent.startsWith('create')) {
      let name = msg.cleanContent.split(' ')[1];
      if (tags.exists(name)) return msg.channel.sendMessage('That tag already exists!');
      let content = msg.cleanContent.split(' ').splice(2).join(' ');
      tags.set(name, content, {author: msg.author.id});
      return msg.channel.sendMessage(`Successfully created tag **${name}**!`);
    } else if (msg.cleanContent.startsWith('remove')) {
      let name = msg.cleanContent.split(' ')[1];
      if (!tags.exists(name)) return msg.channel.sendMessage('That tag does not exist');
      if (tags.get(name).meta.author === msg.author.id || tags.get(name).meta.author === settings.OWNERID) {
        tags.remove(name);
        return msg.channel.sendMessage(`Successfully removed tag **${name}**!`);
      } else {
        return msg.channel.sendMessage('That is not your tag!');
      }
    } else {
      let functions = {
        'name': msg.author.username,
        'channel': msg.channel.toString(),
        'guild': msg.guild.name,
        'random': (min, max) => Math.floor(Math.random() * parseInt(max) - parseInt(min) + 1) + parseInt(min)
      }
      tags.get(msg.cleanContent, functions).then(out => {
        bot.fetchUser(out.meta.author).then(user => {
          msg.channel.sendMessage(`**${msg.cleanContent}** (${user.username}#${user.discriminator})\n${out.data}`.substring(0, 1999)).catch(bot.error);
        }).catch(err => {
          bot.error(err);
          msg.channel.sendMessage(`**${msg.cleanContent}**\n${out.data}`.substring(0, 1999)).catch(bot.error);
        });
      }).catch(console.error);
    }
  },
  tags: tags,
  args: '[create/remove] <name> [content]',
  help: 'Create, remove, or get tags',
  catagory: 'general'
}
