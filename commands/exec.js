module.exports = {
  main: async message => {
    if (message.author.id !== message.client.config.OWNERID) return;
    require('child_process').exec(message.content, (_, out, __) => {
      message.channel.sendCode('', out);
    });
  },
  hide: true
}
