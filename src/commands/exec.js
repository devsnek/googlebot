const childProcess = require('child_process');

module.exports = {
  main: async message => {
    childProcess.exec(message.content, { shell: '/bin/bash' }, (err, stdout, stderr) => {
      if (err) return message.channel.sendCode('', err.message);
      message.channel.send(stdout, { code: true });
    });
  },
  hide: true,
  owner: true
}
