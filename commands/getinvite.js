"use strict";
const http = require('http');
const fs = require('fs');
const request = require('request');

module.exports = {
    main: function(bot, msg, settings) {
        var args = msg.content.split(' ');
        var method = args[0];
        args.shift();
        args = args.join(' ');
        var url = `https://g.1536.cf/i/${method}/${encodeURIComponent(args)}/${settings.config.internalkey}`;
        request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
              var code = JSON.parse(body).url;
              msg.channel.sendMessage("https://discord.gg/"+code);
          }
        });
    },
    help: '',
    args: ''
};
