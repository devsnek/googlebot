module.exports = {
  main: (bot, msg) => {
    msg.channel.sendMessage('<http://lmgtfy.com/?q=' + msg.content.split(' ').join('+') + '>');
  },
  help: 'When someone is being an idiot',
  args: '<query>',
  catagory: 'general'
};
