module.exports = {
  main: message => {
    message.channel.send('Pong!')
      .then((msg) => msg.edit(`Pong! WS Ping: \`${Math.round(message.client.ws.ping)}ms\` | HTTP Ping: \`${msg.createdTimestamp - message.createdTimestamp}ms\``));
  },
  help: 'ping pong ping pong',
  args: '',
  catagory: 'util',
};
