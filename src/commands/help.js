const stripIndent = require('common-tags').stripIndent;

module.exports = {
  main: (message) => {
    const client = message.client;
    const list = client.commands
      .filter(x => !(x.owner || x.disabled))
      .map(x => x.name).sort().join(', ');
    if (!message.content) {
      return message.reply(stripIndent`
        **__Command List__** (use \`help <command name>\` for more details about a specific command)

        ${list}

        https://google.gus.host/compliance
      `);
    }
    const command = client.commands.get(message.content);
    if (!command || (command && (command.owner || command.disabled))) return message.channel.send('**Unknown Command!**');
    message.channel.send(stripIndent`
      __**Command Help**__: **${command.name}**
      **${command.help}**

      \`${command.usage}\`
      \`${command.example}\`
    `);
  },
  help: 'get help',
  args: '[command name]',
};
