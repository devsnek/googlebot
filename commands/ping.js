module.exports = {
  main: async message => message.channel.sendMessage(`pong \`${message.client.ping}ms\``),
  help: 'ping pong ping pong',
  args: '',
  catagory: 'util'
};
