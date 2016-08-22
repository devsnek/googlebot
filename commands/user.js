"use strict";
const request = require('request');

module.exports = {
    main: function(bot, msg, settings) {
        var args = msg.content.split(' ');
        var method = args[0];
        args.shift();
        args = args.join(' ');
        var url = "https://g.1536.cf/user/"+method+"/"+args+"/"+settings.config.internalkey;
        request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
              var user = JSON.parse(body);
              user.game = user.game!=null ? user.game : {"name": "None", "type": 0}
              var final = `\`\`\`xl
Username: ${user.username}
 Discrim: ${user.discriminator}
      ID: ${user.id}
  Status: ${user.status}
  Avatar: ${user.avatar}
     Bot: ${user.bot}
    Game: ${user.game.name} (Streaming: ${user.game.type})
\`\`\``
              msg.channel.sendMessage(final);
          } else {
              msg.channel.sendMessage("Error: "+error);
          }
        });
    },
    help: '',
    args: ''
};
