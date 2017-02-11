module.exports = {
  main: async (message) => {
    const msg = await message.channel.send('Pong!');
    msg.edit(`Pong! WS Ping: \`${Math.round(message.client.ws.ping)}ms\` | HTTP Ping: \`${msg.createdTimestamp - message.createdTimestamp}ms\``);
  },
  help: 'ping pong ping pong',
  args: '',
  catagory: 'util',
};
