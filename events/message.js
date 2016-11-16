const tulpize = require('../util/tulpize');

const superClean = (message, prefix) => {
  return [
    message.content
      .replace(prefix, '')
      .replace(/^,/, '')
      .trim(),
    message.cleanContent
      .replace(prefix, '')
      .replace(/^,/, '')
      .trim()
  ]
}

const checkCommand = message => {
  const client = message.client;
  const original = message.content;
  message.content = message.content.split(' ');
  const command = message.content.shift().toLowerCase();
  message.content = message.content.join(' ');
  if (command in client.commands) {
    client.commands[command].main(message);
  } else {
    message.content = original;
    client.commands.knowledgegraph.main(message);
  }
}

module.exports = async message => {
  // checks and setting up of variables and such
  const client = message.client;

  if (message.channel.type === 'dm' && !client.config.OWNERS.includes(message.author.id)) return;
  if (message.author.bot) return;

  client.rethink.activateGuild(message.guild);

  [message.content, message.cleanContent] = tulpize(message);

  // message processing
  if (client.config.prefix.test(message.content)) {
    [message.content, message.cleanContent] = superClean(message, client.config.prefix);
    checkCommand(message);
  } else if (message.guild.settings) {
    if (!message.guild.settings.prefix) return;
    if (!message.content.startsWith(message.guild.settings.prefix)) return;
    [message.content, message.cleanContent] = superClean(message, message.guild.settings.prefix);
    checkCommand(message);
  }
}
