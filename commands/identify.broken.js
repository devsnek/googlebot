var request = require('request');

module.exports = {
    main: function(bot, msg) {
        args = msg.content.split(' ');
        console.log("IDENTIFY", msg.server.name, msg.server.id, args);

        var options = {
            uri: 'https://www.captionbot.ai/api/message',
            method: 'POST',
            json: {
                "conversationId":"4WDK7tprQkA",
                "waterMark":"",
                "userMessage":args[0]
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
