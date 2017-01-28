module.exports = {
  main: async message => {
    message.channel.send(`<http://lmgtfy.com/?q=${message.content.split(' ').join('+')}>`);
  },
  help: 'When someone is being an idiot',
  args: '<query>',
  catagory: 'general',
};
