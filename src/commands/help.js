module.exports = function help(message) {
  const list = Object.entries(message.client.commands)
    .filter(([, v]) => !v.owner)
    .map(([k]) => k)
    .join(', ');
  message.reply(`__Available Commands:__\n${list}`);
};
