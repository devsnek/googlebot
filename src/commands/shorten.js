module.exports = {
  main: async message => {
    message.channel.send(await message.client.util.shorten(message.content.replace(/<|>/g, '')));
  },
  help: 'Shorten a url using goo.gl',
  args: '<url>',
  catagory: 'general'
}
