module.exports = {
  main: (message) => {
    const client = message.client;
    client.log('EVAL WAS RUN!');
    let res;
    try {
      res = eval(message.content); // eslint-disable-line no-eval
      if (typeof res !== 'string') res = require('util').inspect(res);
    } catch (err) {
      res = err.message;
    }
    message.channel.sendCode('js', res);
  args: '',
  help: 'run some eval, bruh',
  hide: true,
  owner: true,
};
