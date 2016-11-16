const path = require('path');

module.exports = {
  main: async message => {
    const commands = message.client.commands;
    const command = message.content;
    if (!message.client.config.OWNERS.includes(message.author.id)) return;
    try {
      delete commands[command];
      const pth = path.resolve(`./commands/${command}.js`)
      delete require.cache[pth];
      commands[command] = require(pth);
      message.channel.sendMessage('Reloaded ' + command);
    } catch (err) {
      message.channel.sendMessage('Command not found or error reloading\n`' + err.message + '`');
    }
  },
  hide: true
}
