'use strict';

let unirest = require("unirest");
let cheerio = require('cheerio');


module.exports = {
    main: function(bot, msg, settings) {
        unirest.get("http://time.is/"+msg.content)
        .end(res => {
            let $ = cheerio.load(res.body);
            bot.sendMessage(msg, `${$('#msgdiv > h1').text()} is ${$('#dd').text()}, ${$('#twd').text()}`);
        });
    }
}
