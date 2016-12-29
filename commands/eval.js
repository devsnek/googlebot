module.exports = {
  main: async message => {
    const client = message.client;
    const args = message.content;
    client.log('EVAL WAS RUN!');
    try {
      var res = eval(args); // eslint-disable-line no-eval
      if (typeof res !== 'string') res = require('util').inspect(res);
    } catch (err) {
      res = err.message;
    }
    message.channel.send(res, { code: 'js' });
  },
  args: '',
  help: 'run some eval, bruh',
  hide: true,
  owner: true
};
