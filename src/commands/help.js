module.exports = {
  main: async (message) => {
    const client = message.client;
    const list = client.commands
      .filter(x => !(x.owner || x.disabled))
      .map(x => x.name).sort().join(', ');
    if (!message.content) return message.reply(`\n**__Command List__** (use \`help <command name>\` for more details about a specific command)\n\n${list}`);
    const command = client.commands.get(message.content);
    if (!command || (command && (command.owner || command.disabled))) return message.channel.send('**Unknown Command!**');
    message.channel.send(`__**Command Help**__: **${command.name}**\n**${command.help}**\n\n\`${command.usage}\``);
  },
  help: 'get help',
  args: '[command name]',
};
