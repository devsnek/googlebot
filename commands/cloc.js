module.exports = {
  main: async (bot, msg, settings) => {
    require('child_process').exec('cloc --exclude-dir=node_modules --json /home/ubuntu/googlebot', (_, out, __) => {
      msg.channel.sendMessage(JSON.parse(out).JavaScript.code + ' lines of code!');
    });
  },
  hide: true
}
