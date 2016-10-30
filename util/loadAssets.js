module.exports = (client, dirname) => {
  client.commands = {};
  require('./loadCommands')(client, dirname);
  client.messages = {};
  require('./loadMessages')(client, dirname);
}
