const unirest = require('unirest');

module.exports = {
  main: function(bot, msg) {
    var args = msg.content;
    bot.log("IDENTIFY", msg.server.name, msg.server.id, args);

    msg.channel.sendMessage("`Identifying...`").then(message => {
    unirest.get("https://www.captionbot.ai/api/init")
    .end(res => {
      var data = {
        "conversationId": res.body,
        "waterMark":"",
        "userMessage":args
      }

      unirest.post('https://www.captionbot.ai/api/message')
      .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
      .send(options.json)
      .end(res => {
        unirest.get("https://www.captionbot.ai/api/message?waterMark=&conversationId="+data.conversationId)
        .end(res => {
          bot.log("Identify: ", msg.server.name, msg.server.id, "|", args, "|", data.conversationId);
          try {
            message.edit("**"+JSON.parse(res.body).BotMessages[1]+"**");
          } catch (err) {
            message.edit('**Could not identify image!**');
          }
        });
      });
      });
    });
  },
  help: 'Identify an image',
  args: '<url>',
  catagory: 'general'
};
