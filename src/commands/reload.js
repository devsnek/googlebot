const path = require('path');

module.exports = {
  main: (message) => {
    const commands = message.client.commands;
    const command = message.content;
    try {
      delete commands[command];
      const pth = path.resolve(`./commands/${command}.js`);
      delete require.cache[pth];
      commands[command] = require(pth);
      message.channel.send(`**Reloaded ${command}**`);
    } catch (err) {
      message.channel.send(`**Command not found or error reloading\n\`${err.message}\`**`);
    }
  },
  hide: true,
  owner: true,
};
