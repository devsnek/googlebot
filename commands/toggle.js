module.exports = {
  main: async (message) => {
    message.client.sendIpc('toggle', message.content);
  },
  hide: true,
  owner: true
}
