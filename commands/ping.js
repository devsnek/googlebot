module.exports = {
  main: async (bot, msg, settings) => {
    const message = msg.channel.sendMessage('pong');
    message.edit(`pong ${message.createdTimestamp - msg.createdTimestamp}ms`);
  },
  help: 'ping pong ping pong',
  args: '',
  catagory: 'util'
};
