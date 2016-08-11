module.exports = {
    main: function(bot, msg, settings) {
        var start = process.hrtime();
        bot.sendMessage(msg, "pong", function(err, message){
            var diff = Math.round(process.hrtime(start)[1]/1000000);
            bot.updateMessage(message, "pong `"+diff+"ms`");
        });
    },
    help: 'ping pong ping pong',
    args: ''
};
