const minimist = require('minimist');
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
  const parsed = minimist(message.content);
  let command = message.content.shift().toLowerCase();
  message.content = message.content.join(' ');
  if (client.commands.has(command)) {
    command = client.commands.get(command);
    if ((command.owner || command.disabled) && !client.config.OWNERS.includes(message.author.id)) return;
    command.main(message, parsed);
  } else {
    message.content = original;
    client.commands.get('knowledgegraph').main(message, parsed);
  }
}

module.exports = async message => {
  // checks and setting up of variables and such
  const client = message.client;

  client.util.watching({
    type: 'SENT MESSAGE',
    user: message.author,
    context: message.guild ? `${message.guild.name} | ${message.channel.name}` : `DM: ${message.author.username}`,
    content: message.content
  });

  if (message.channel.type === 'dm' && !client.config.OWNERS.includes(message.author.id)) return;
  if (message.author.bot) return;

  client.rethink.activateGuild(message.guild);

  [message.content, message.cleanContent] = tulpize(message);

  // message processing
  if (client.prefix.test(message.content)) {
    [message.content, message.cleanContent] = superClean(message, client.prefix);
    checkCommand(message);
  } else if (message.guild.settings) {
    if (!message.guild.settings.prefix) return;
    if (!message.content.startsWith(message.guild.settings.prefix)) return;
    [message.content, message.cleanContent] = superClean(message, message.guild.settings.prefix);
    checkCommand(message);
  }
}
