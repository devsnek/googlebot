module.exports = {
    main: function(bot, msg) {
        msg.channel.sendMessage("<http://lmgtfy.com/?q="+msg.content.split(' ').join('+')+">");
    },
    help: 'template'
};
