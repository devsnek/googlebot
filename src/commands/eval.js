const util = require('util');
// const { VM } = require('vm2');

module.exports = {
  main: (message) => {
    const client = message.client;
    client.log('EVAL WAS RUN!');
    let res;
    try {
      // if (client.config.OWNERS.includes(message.author.id)) {
      //   res = eval(message.content); // eslint-disable-line no-eval
      // } else {
      //   const vm = new VM();
      //   res = vm.run(message.content);
      // }
      res = eval(message.content); // eslint-disable-line no-eval
      if (typeof res !== 'string') res = util.inspect(res);
    } catch (err) {
      res = err.message;
    }
    message.channel.sendCode('js', res);
  args: '',
  help: 'run some eval, bruh',
  hide: true,
  owner: true,
};
