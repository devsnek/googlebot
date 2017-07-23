module.exports = function help(message) {
  message.reply(Object.keys(message.client.commands).join(', '));
};
