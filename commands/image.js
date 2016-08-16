request = require("request");
var r = require('rethinkdb');
var cheerio = require('cheerio');
var querystring = require('querystring');

module.exports = {
    main: function(bot, msg, settings) {
        var args = msg.content;
        safe_map = {
            1: "off",
            2: "medium",
            3: "high"
        };
        bot.sendMessage(msg, "`Searching...`", function(err, message) {
            var key = settings.KEYS[settings.lastKey + 1];
            r.db('google').table('servers').get(msg.server.id).run(settings.dbconn, function(err, thing) {
                if (thing === null) {
                    safe_setting = 'medium'
                } else {
                    safe_setting = safe_map[parseInt(thing.nsfw)];
                }
                var safe = (msg.channel.name.includes("nsfw") ? "off" : safe_setting);
                bot.log("Image:", msg.server.name, msg.server.id, "|", args, "|", safe, "|", key, settings.lastKey + 1);
                var url = "https://www.googleapis.com/customsearch/v1?key=" + key + "&cx=" + settings.config.cxImg + "&safe=" + safe + "&searchType=image&q=" + encodeURI(args);
                try {
                    request(url, function(error, response, body) {
                        try {
                            bot.updateMessage(message, JSON.parse(body)['items'][0]['link']);
                        } catch (err) {
                            request('https://www.google.com/search?tbm=isch&gs_l=img&q='+encodeURI(args), function (error, response, body) {
                              if (!error && response.statusCode == 200) {
                                $ = cheerio.load(body);
                                var src = $('.images_table').find('img').first().attr('src');
                                bot.updateMessage(message, src);
                              } else {
                                bot.updateMessage(message, "`No results found!`");
                              }
                            });
                        }
                    });
                } catch (err) {
                    bot.updateMessage(message, "`No results found!`");
                }
                settings.lastKey += 1;
                if (settings.lastKey + 1 >= settings.KEYS.length) settings.lastKey = 0;
            });
        });
    },
    args: '<query>',
    help: 'google things'
};
