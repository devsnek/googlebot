request = require("request");
var r = require('rethinkdb');
var cheerio = require('cheerio');
var querystring = require('querystring');

module.exports = {
    main: function(bot, msg, settings) {
        var args = msg.content.trimLeft();
        safe_map = {
            1: "off",
            2: "medium",
            3: "high"
        };
        msg.channel.sendMessage("`Searching...`").then(message => {
            var key = settings.KEYS[settings.lastKey + 1];
            r.db('google').table('servers').get(msg.guild.id).run(settings.dbconn, function(err, thing) {
                if (thing === null) {
                    safe_setting = 'medium';
                } else {
                    safe_setting = safe_map[parseInt(thing.nsfw)];
                }
                var safe = (msg.channel.name.includes("nsfw") ? "off" : safe_setting);
                bot.log("Search:", msg.guild.name, msg.guild.id, "|", args, "|", safe, "|", key, settings.lastKey + 1);
                var url = "https://www.googleapis.com/customsearch/v1?key=" + key + "&cx=" + settings.config.cx + "&safe=" + safe + "&q=" + encodeURI(args);
                try {
                    request(url, function(error, response, body) {
                        try {
                            message.edit(JSON.parse(body)['items'][0]['link']);
                        } catch (err) {
                            request('https://www.google.com/search?safe='+safe+'&q='+encodeURI(args), function(err, res, body) {
                                if (res.statusCode !== 200) {
                                    bot.error('STATUS:', res.statusCode, 'BODY:', body);
                                    message.edit("`No results found!`");
                                } else {
                                    $ = cheerio.load(body);
                                    try {
                                        var href = $('.r').first().find('a').first().attr('href');
                                        var res = Object.keys(querystring.parse(href.substr(7, href.length)))[0];
                                        if (res == '?q') {
                                          message.edit('`No results found`');
                                        } else {
                                          message.edit(res);
                                        }
                                    } catch (err) {
                                        bot.error(err);
                                        message.edit('`No results found`');
                                    }
                                }
                            });
                        }
                    });
                } catch (err) {
                    message.edit('`No results found`');
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
