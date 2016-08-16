var request = require("request");

module.exports = {
     main: function(bot, msg, settings) {
        var args = msg.content;
        bot.log("DEFINE", args);
        bot.sendMessage(msg, "`Opening Dictionary...`", function(err, message){
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
                        bot.updateMessage(message, "```xl\nDefinitions for "+args+":\n"+final+"\n```");
                    } catch (err) {
                        bot.updateMessage(message, "`No results found!`");
                    }
                }
            });
        });
     },
     args: '<query>',
     help: 'google things'
};
