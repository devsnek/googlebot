module.exports = function ping(message) {
  message.reply(`Pong! ${Date.now() - message.createdAt.getTime()}ms`);
};
