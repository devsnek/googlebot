"use strict";
var http = require('http');
var fs = require('fs');
var request = require('request');

module.exports = {
    main: function(bot, msg, settings) {
        var args = msg.content.split(' ');
        args.splice(0, 2);
        var url = "https://g.1536.cf/i/"+encodeURIComponent(args.join(' '))+"/"+settings.config.internalkey;
        request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
              var code = JSON.parse(body).url;
              bot.sendMessage(msg, "https://discord.gg/"+code);
          }
        });
    },
    help: '',
    args: ''
};

