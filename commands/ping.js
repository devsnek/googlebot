module.exports = {
    main: function(bot, msg, settings) {
        var start = process.hrtime();
        msg.channel.sendMessage("pong").then(message => {
            var diff = Math.round(process.hrtime(start)[1]/1000000);
            message.edit("pong `"+diff+"ms`");
        });
    },
    help: 'ping pong ping pong',
    args: ''
};
