module.exports = {
  main: async (message) => {
    let command = message.content;
    const commands = message.client.commands;
    if (!commands.has(command)) return;
    command = commands.get(command);
    command.disabled = !command.disabled;
  },
  hide: true,
  owner: true
}
