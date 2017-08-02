const util = require('util');

module.exports = async function debug(message) {
  const client = message.client; // eslint-disable-line no-unused-vars
  let res;
  try {
    res = eval(message.content);
    if (res instanceof Promise) res = await res;
    if (!(typeof res === 'string' && res.includes('\n'))) {
      res = util.inspect(res, { depth: 1, maxArrayLength: 10 });
    }
  } catch (err) {
    res = err.message;
  }

  message.reply(`Input:\n${message.content}\nOutput:\n${res}`, { code: 'js' });
};

module.exports.owner = true;
