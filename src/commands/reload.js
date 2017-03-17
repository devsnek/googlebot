module.exports = {
  main: (message) => {
    message.client.commands.reload(message.content);
  },
  hide: true,
  owner: true,
};
