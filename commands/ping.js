module.exports = {
  main: async message => message.channel.sendMessage(`pong \`${Math.round(message.client.ping)}ms\``),
  help: 'ping pong ping pong',
  args: '',
  catagory: 'util'
};
