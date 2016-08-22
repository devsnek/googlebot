const unirest = require('unirest');

module.exports = {
    main: function(bot, msg) {
        args = msg.content;
        bot.log("IDENTIFY", msg.server.name, msg.server.id, args);

        msg.channel.sendMessage("`Identifying...`").then(message => {
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
                bot.log("Identify: ", msg.server.name, msg.server.id, "|", args, "|", options.json.conversationId);
                try {
                  message.edit("**"+JSON.parse(res.body).BotMessages[1]+"**");
                } catch (err) {
                  message.edit('**Could not identify image!**');
                }
              });
            });
        });
        });
    }
};
