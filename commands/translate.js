'use strict';
const request = require('request');
const iso = require('iso-639-1').default;

module.exports = {
    main: function(bot, msg, settings) {
        let args = msg.content.replace(/"/g, '');
        let tolang = args.split(' ')[args.split(' ').length - 1];
        tolang = iso.getCode(tolang) == '' ? tolang : iso.getCode(tolang);
        args = args.replace((" " + args.split(' ')[args.split(' ').length - 1]), '')
        let yurl = "https://translate.yandex.net/api/v1.5/tr.json/detect?key="+settings.config.yandex+"&text="+args;
        request(yurl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let fromlang = JSON.parse(body)['lang'];
                let gurl = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="+fromlang+"&tl="+tolang+"&dt=t&q="+args;
                request(gurl, function(error, response, body) {
                    try {
                        let translated = body.match(/^\[\[\[".+?",/)[0];
                        translated = translated.substring(4, translated.length-2);
                        msg.channel.sendMessage("```\nTranslated:\n" + translated + "\n```");
                    } catch (err) {
                        msg.channel.sendMessage("`Input was invalid`");
                    }
                });
            }
        });
    },
    help: 'template'
};
