//var _eval = require('eval');
//var safeEval = require('safe-eval');

module.exports = {
     main: function(bot, msg, settings, bots) {
        if (msg.author.id == settings.OWNERID) {
            args = msg.content.split(' ');
            args.splice(0, 2);
            args = args.join(' ');
            console.log(args);
            try {
                //var res = _eval('('+args+')');
                var res = eval(args);
                //var res = safeEval(args);
                if (typeof res != 'string') {
                    res = require("util").inspect(res);
                }
            }
            catch (err) {
                var res = err.message;
            }
            bot.sendMessage(msg, "```js\n"+res+"\n```");
        }
     },
     args: '',
     help: 'run some eval, bruh',
     hide: true
};

