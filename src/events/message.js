const minimist = require('minimist');
const tulpize = require('../util/tulpize');

const superClean = (message, prefix) =>
  [
    message.content
      .replace(prefix, '')
      .replace(/^,/, '')
      .trim(),
    message.cleanContent
      .replace(prefix, '')
      .replace(/^,/, '')
      .trim(),
  ]
;

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
    client.raven.context(command.main.bind(command.main, message, parsed));
  } else {
    message.content = original;
    command = client.commands.get('knowledgegraph');
    client.raven.context(command.main.bind(command.main, message, parsed));
  }
};

module.exports = (message) => {
  // checks and setting up of variables and such
  const client = message.client;

  if (message.channel.type === 'dm' && !client.config.OWNERS.includes(message.author.id)) return;
  if (message.author.bot) return;

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
};
