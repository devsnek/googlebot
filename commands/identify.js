var request = require('request');

module.exports = {
    main: function(bot, msg) {
        args = msg.content.split(' ');
        args.splice(0, 2);
        args = args.join(' ');

        var options = {
            uri: 'https://www.captionbot.ai/api/message',
            method: 'POST',
            json: {
                "conversationId":"4WDK7tprQkA",
                "waterMark":"",
                "userMessage":args
            }
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                bot.sendMessage(msg, "```\n"+JSON.parse(body)["UserMessage"]+"\n```");
            }
        });
    },
    help: 'template'
};
