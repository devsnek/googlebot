const TagManager = require('tagmanager');

const tags = new TagManager();

module.exports = {
  main: async message => {
    const client = message.client;
    if (message.cleanContent.startsWith('create')) {
      let name = message.cleanContent.split(' ')[1];
      if (tags.exists(name)) return message.channel.send('That tag already exists!');
      let content = message.cleanContent.split(' ').splice(2).join(' ');
      tags.set(name, content, {author: message.author.id});
      return message.channel.send(`Successfully created tag **${name}**!`);
    } else if (message.cleanContent.startsWith('remove')) {
      let name = message.cleanContent.split(' ')[1];
      if (!tags.exists(name)) return message.channel.send('That tag does not exist');
      if ((await tags.get(name)).meta.author === message.author.id || client.config.OWNERS.includes(message.author.id)) {
        tags.remove(name);
        return message.channel.send(`Successfully removed tag **${name}**!`);
      } else {
        return message.channel.send('That is not your tag!');
      }
    } else {
      let functions = {
        'name': message.author.username,
        'channel': message.channel.toString(),
        'guild': message.guild.name,
        'random': (min, max) => Math.floor(Math.random() * parseInt(max) - parseInt(min) + 1) + parseInt(min)
      }
      try {
        const out = await tags.get(message.cleanContent, functions);
        await client.fetchUser(out.meta.author).then(user => {
          message.channel.send(`**${message.cleanContent}** (${user.username}#${user.discriminator})\n${out.data}`.substring(0, 1999)).catch(client.error);
        }).catch(err => {
          client.error(err);
          message.channel.send(`**${message.cleanContent}**\n${out.data}`.substring(0, 1999)).catch(client.error);
        });
      } catch (err) {
        message.channel.send('`Tag not found!`')
      }
    }
  },
  tags: tags,
  args: '[create/remove] <name> [content]',
  help: 'Create, remove, or get tags',
  catagory: 'general'
}
