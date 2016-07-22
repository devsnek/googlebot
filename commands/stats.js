module.exports = {
    main: function(bot, msg, settings) {
        bot.sendMessage(msg, settings.stats.getData('/searches'));
    },
    help: 'template'
};
