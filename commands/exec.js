const childProcess = require('child_process');

module.exports = {
  main: async message => {
    if (message.author.id !== message.client.config.OWNERID) return;
    childProcess.exec(message.content, { shell: '/bin/bash' }, (err, stdout, stderr) => {
      if (err) return message.channel.sendCode('', err.message);
      message.channel.sendCode('', stdout);
    });
  },
  hide: true
}
