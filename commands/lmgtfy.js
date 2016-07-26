module.exports = {
    main: function(bot, msg) {
        bot.sendMessage(msg, "<http://lmgtfy.com/?q="+msg.content.split(' ').join('+')+">");
    },
    help: 'template'
};
