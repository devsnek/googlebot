const childProcess = require('child_process');

module.exports = {
  main: (message) => {
    childProcess.exec(message.content, { shell: '/bin/bash' }, (err, stdout) => {
      if (err) return message.channel.send(err.message, { code: true });
      message.channel.send(stdout, { code: true });
    });
  },
  hide: true,
  owner: true,
};
