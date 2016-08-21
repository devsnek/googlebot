const util = require('util');
const vm = require('vm');

const sandbox = {
  bot: { internal: { token: 'how about no' } }
};

const context = new vm.createContext(sandbox);

module.exports = {
     main: function(bot, msg, settings, bots) {
        let args = msg.content;
        if (msg.author.id == settings.OWNERID) {
          bot.log('EVAL WAS RUN!');
          try {
            var res = eval(args);
            if (typeof res != 'string') {
              res = util.inspect(res);
            }
          } catch (err) {
            var res = err.message;
          }
          bot.sendMessage(msg, "```js\n"+res+"\n```");
        } else {
          try {
            let script = new vm.Script(args);
            let res = script.runInContext(context);
            if (typeof res != 'string') {
              res = util.inspect(res);
            }
          } catch (err) {
            res = err.message;
          }
          bot.sendMessage(msg, "```js\n"+res+"\n```");
        }
     },
     args: '',
     help: 'run some eval, bruh',
     hide: true
};

