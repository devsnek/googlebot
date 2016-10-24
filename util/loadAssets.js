module.exports = (client, dirname) => {
  require('./loadCommands')(client, dirname);
  require('./loadMessages')(client, dirname);
}
