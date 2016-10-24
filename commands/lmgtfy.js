module.exports = {
  main: async message => {
    message.channel.sendMessage('<http://lmgtfy.com/?q=' + message.content.split(' ').join('+') + '>');
  },
  help: 'When someone is being an idiot',
  args: '<query>',
  catagory: 'general'
};
