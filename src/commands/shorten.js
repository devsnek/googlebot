module.exports = {
  main: message => {
    message.client.util.shorten(message.content.replace(/<|>/g, ''))
      .then((link) => message.channel.send(link));
  },
  help: 'Shorten a url using goo.gl',
  args: '<url>',
  catagory: 'general',
};
