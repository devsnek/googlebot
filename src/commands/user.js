module.exports = {
  main: message => {
    message.client.fetchUser(message.content)
      .then((user) => message.channel.send(JSON.stringify(user)));
  },
  hide: true,
};
