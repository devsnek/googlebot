'use strict';

var unirest = require('unirest');

module.exports = {
    main: function(bot, msg, settings) {
        let url = "https://www.googleapis.com/urlshortener/v1/url?key="+settings.config.shortenKey;
        unirest.post(url)
          .set('Content-Type', 'application/json')
          .send({"longUrl": msg.content})
          .end(res => {
              msg.channel.sendMessage(res.body.id);
          });
    }
}
