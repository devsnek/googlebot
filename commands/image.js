const request = require("request");
const r = require('rethinkdb');
const cheerio = require('cheerio');
const querystring = require('querystring');

module.exports = {
    main: function(bot, msg, settings) {
        var args = msg.content;
        safe_map = {
            1: "off",
            2: "medium",
            3: "high"
        };
        msg.channel.sendMessage("`Searching...`").then(message => {
            var key = settings.KEYS[settings.lastKey + 1];
            r.db('google').table('servers').get(msg.guild.id).run(settings.dbconn, function(err, thing) {
                if (thing === null) {
                    safe_setting = 'medium'
                } else {
                    safe_setting = safe_map[parseInt(thing.nsfw)];
                }
                var safe = (msg.channel.name.includes("nsfw") ? "off" : safe_setting);
                bot.log("Image:", msg.guild.name, msg.guild.id, "|", args, "|", safe, "|", key, settings.lastKey + 1);
                var url = "https://www.googleapis.com/customsearch/v1?key=" + key + "&cx=" + settings.config.cxImg + "&safe=" + safe + "&searchType=image&q=" + encodeURI(args);
                try {
                    request(url, function(error, response, body) {
                        try {
                            message.edit(JSON.parse(body)['items'][0]['link']);
                        } catch (err) {
                            request('https://www.google.com/search?tbm=isch&gs_l=img&q='+encodeURI(args), function (error, response, body) {
                              if (!error && response.statusCode == 200) {
                                $ = cheerio.load(body);
                                var src = $('.images_table').find('img').first().attr('src');
                                if (src) {
                                  message.edit(src);
                                } else {
                                  message.edit("`No results found!`");
                                }
                              } else {
                                message.edit("`No results found!`");
                              }
                            });
                        }
                    });
                } catch (err) {
                    message.edit("`No results found!`");
                }
                settings.toBeDeleted.set(msg.id, message.id);
                settings.lastKey += 1;
                if (settings.lastKey + 1 >= settings.KEYS.length) settings.lastKey = 0;
            });
        });
    },
    args: '<query>',
    help: 'google things'
};
