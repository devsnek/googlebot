module.exports = {
    main: function(bot, msg, settings) {
        args = msg.content.split(' ');
        args.splice(0, 2);
        args = args.join(' ');
        if (args == '') {
            var start = process.hrtime();
            bot.sendMessage(msg, "pong", function(err, message){
                var diff = Math.round(process.hrtime(start)[1]/1000000);
                bot.updateMessage(message, "pong `"+diff+"ms`");
                //settings.dping.set(diff);
            });
        } else {
            require('child_process').exec("ping -c 4 "+args, function(error, stdout, stderr) {
                bot.sendMessage(msg, "```\n"+stdout+"\n```");
            });
        }
    },
    help: 'ping pong ping pong',
    args: ''
};
