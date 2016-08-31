module.exports = {
     main: function(bot, msg, settings, bots) {
        if (msg.author.id == settings.OWNERID) {
            args = msg.content;
            bot.log('EVAL WAS RUN!');
            try {
                var res = eval(args);
                if (typeof res != 'string') {
                    res = require("util").inspect(res);
                }
            }
            catch (err) {
                var res = err.message;
            }
            msg.channel.sendMessage("```js\n"+res+"\n```").then(message => {
              settings.toBeDeleted.set(msg.id, message.id);
            });
        }
     },
     args: '',
     help: 'run some eval, bruh',
     hide: true
};
