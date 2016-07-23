request = require("request");

module.exports = {
     main: function(bot, msg, settings) {
        var args = msg.content;
        safe_map = {1: "off", 2: "medium", 3: "high"};
        bot.sendMessage(msg, "`Searching...`", function(err, message){
            var key = settings.KEYS[Math.floor(Math.random() * settings.KEYS.length)];
            try {
                var db = new JsonDB("servers", true, true);
                safe_setting = safe_map[db.getData("/server/"+msg.server.id)['nsfw']];
            } catch (err) {
                safe_setting = 'medium';
            }
            var safe = (msg.channel.name.includes("nsfw") ? "off" : safe_setting);
            console.log("Image: ", msg.server.name, msg.server.id, "|", args, "|", safe);
            var url = "https://www.googleapis.com/customsearch/v1?key="+key+"&cx="+settings.config.cx+"&safe="+safe+"&q="+encodeURI(args);
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    //console.log(JSON.parse(body)['items'][0]['link']);
                    try {
                        bot.updateMessage(message, JSON.parse(body)['items'][0]['pagemap']['cse_image'][0]['src']);
                    } catch (err) {
                        bot.updateMessage(message, "`No results found!`");
                    }
                }
            });
         });
     },
     args: '<query>',
     help: 'get an image'
};
