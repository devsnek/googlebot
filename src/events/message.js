const minimist = require('minimist');
const tulpize = require('../util/tulpize');

const superClean = (message, prefix) => {
  message.content = message.content
    .replace(prefix, '')
    .replace(/^,/, '')
    .trim();
  message.cleanContent = message.cleanContent
    .replace(prefix, '')
    .replace(/^,/, '')
    .trim();
};

module.exports = (message) => {
  const client = message.client;
  if (message.channel.type === 'dm' && !client.config.OWNERS.includes(message.author.id)) return;
  if (message.author.bot) return;
  tulpize(message);
  if (!client.prefix.test(message.content)) return;
  superClean(message, client.prefix);

  const original = message.content;
  message.content = message.content.split(' ');
  message.options = minimist(message.content);
  let command = message.content.shift().toLowerCase();
  message.content = message.content.join(' ');
  if (client.commands.has(command)) {
    client.commands.eventCounter.trigger(command);
    command = client.commands.get(command);
    if ((command.owner || command.disabled) && !client.config.OWNERS.includes(message.author.id)) return;
    client.raven.context(command.main.bind(command.main, message));
  } else {
    client.commands.eventCounter.trigger('fallback');
    message.content = original;
    command = client.commands.get('knowledgegraph');
    client.raven.context(command.main.bind(command.main, message));
  }
};
