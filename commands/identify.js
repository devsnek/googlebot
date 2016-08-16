var unirest = require('unirest');

module.exports = {
    main: function(bot, msg) {
        args = msg.content;
        console.log("IDENTIFY", msg.server.name, msg.server.id, args);

        bot.sendMessage(msg, "`Identifying...`", (err, message) => {
        unirest.get("https://www.captionbot.ai/api/init")
        .end(res => {
            var options = {
                uri: 'https://www.captionbot.ai/api/message',
                json: {
                    "conversationId": res.body,
                    "waterMark":"",
                    "userMessage":args
                }
            };

            unirest.post(options.uri)
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send(options.json)
            .end(res => {
              unirest.get("https://www.captionbot.ai/api/message?waterMark=&conversationId="+options.json.conversationId)
              .end(res => {
                console.log("Identify: ", msg.server.name, msg.server.id, "|", args, "|", options.json.conversationId);
                try {
                  bot.updateMessage(message, "**"+JSON.parse(res.body).BotMessages[1]+"**");
                } catch (err) {
                  bot.updateMessage(message, '**Could not identify image!**');
                }
              });
            });
        });
        });
    }
};
