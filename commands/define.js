var request = require("request");
var xml2js = require('xml2js').parseString;

module.exports = {
     main: function(bot, msg, settings) {
        var args = msg.content.split(' ');
        args.splice(0, 2);
        args = args.join(' ');
        console.log(args);
        bot.sendMessage(msg, "`Searching...`", function(err, message){
            url = "http://services.aonaware.com//dictservice/dictservice.asmx/DefineInDict?dictId=wn&word="+args;
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var response;
                    xml2js(body, function (err, result) {response = result;});
                    try {
                        try {
                            bot.updateMessage(message, "```\n"+response['WordDefinition']['Definitions'][0]['Definition'][0]['WordDefinition']+"\n```");
                        } catch (err) {
                            console.log(err);
                            bot.updateMessage(message, "```\n"+response['WordDefinition']['Definitions'][0]['Definition']['WordDefinition']+"\n```");
                        }
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
