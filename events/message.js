const tulpize = require('../util/tulpize');

const checkCommand = message => {
  const client = message.client;
  const original = message.content;
  message.content = message.content.split(' ');
  const command = message.content.shift();
  message.content = message.content.join(' ');
  if (command in client.commands) {
    client.commands[command].main(message);
  } else {
    message.content = original;
    client.commands['search'].main(message);
  }
}

module.exports = async message => {
  // checks and setting up of variables and such
  const client = message.client;

  message.content = tulpize(message.content);

  if (message.channel.type === 'dm' && message.author.id !== client.config.OWNERID) return;
  if (message.author.bot) return;

  client.rethink.activateGuild(message.guild);

  // message processing
  if (client.config.prefix.test(message.content)) {
    message.content = message.content
      .replace(client.config.prefix, '')
      .replace(/^,/, '')
      .trim()
    checkCommand(message);
  } else if (message.guild.settings) {
    if (!message.guild.settings.prefix) return;
    if (!message.content.startsWith(message.guild.settings.prefix)) return;
    message.content = message.content.replace(message.guild.settings.prefix, '').trim();
    checkCommand(message);
  }
}
