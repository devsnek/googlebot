module.exports = {
  main: async message => {
    const msg = await message.channel.sendMessage('pong');
    msg.edit(`pong \`${msg.createdTimestamp - message.createdTimestamp}ms\``);
  },
  help: 'ping pong ping pong',
  args: '',
  catagory: 'util'
};
