module.exports = {
  main: async (client, message) => {
    require('child_process').exec('cloc --exclude-dir=node_modules --json /home/ubuntu/googlebot', (_, out) => {
      message.channel.send(`${JSON.parse(out).JavaScript.code} lines of code!`);
    });
  },
  hide: true,
};
