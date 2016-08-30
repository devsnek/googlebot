var request = require("request");

module.exports = {
     main: function(bot, msg, settings) {
        var args = msg.content;
        bot.log("DEFINE", args);
        msg.channel.sendMessage("`Opening Dictionary...`").then(message => {
            url = "https://wordsapiv1.p.mashape.com/words/"+args;
            var headers = {'X-Mashape-Key': settings.config.wordsApi, 'Accept': 'application/json'}
            request({url: url, headers: headers}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  var response = JSON.parse(body);
                  var final = "";
                  try {
                    for (var item in response.results) {
                      final += (parseInt(item)+1) + ": "+response.results[item].definition + "\n"
                    }
                    message.edit("```xl\nDefinitions for "+args+":\n"+final+"\n```");
                  } catch (err) {
                    message.edit("`No results found!`");
                  }
                } else {
                  message.edit("`No results found!`");
                }
                settings.toBeDeleted.set(msg.id, message.id);
            });
        });
     },
     args: '<query>',
     help: 'google things'
};
