request = require("request");
var r = require('rethinkdb');

module.exports = {
     main: function(bot, msg, settings) {
        var args = msg.content;
        safe_map = {1: "off", 2: "medium", 3: "high"};
        bot.sendMessage(msg, "`Searching...`", function(err, message){
            var key = settings.KEYS[Math.floor(Math.random() * settings.KEYS.length)];
            r.connect({ host: settings.config.rethink, port: 28015 }, function(err, conn) {
                r.db('google').table('servers').get(msg.server.id).run(conn, function(err, thing){
                    if (thing === null) {
                        safe_setting = 'medium'
                    } else {
                        safe_setting = safe_map[parseInt(thing.nsfw)];
                    }
                    var safe = (msg.channel.name.includes("nsfw") ? "off" : safe_setting);
                    console.log("Image: ", msg.server.name, msg.server.id, "|", args, "|", safe);
                    var url = "https://www.googleapis.com/customsearch/v1?key="+key+"&cx="+settings.config.cx+"&safe="+safe+"&q="+encodeURI(args);
                    request(url, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            try {
                                bot.updateMessage(message, JSON.parse(body)['items'][0]['pagemap']['cse_image'][0]['src']);
                            } catch (err) {
                                bot.updateMessage(message, "`No results found!`");
                            }
                        }
                    });
                });
            });
         });
     },
     args: '<query>',
     help: 'get an image'
};
