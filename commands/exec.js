module.exports = {
  main: async (bot, msg, settings) => {
    if (msg.author.id !== settings.OWNERID) return;
    require('child_process').exec(msg.content, (_, out, __) => {
      msg.channel.sendCode(out);
    });
  },
  hide: true
}
