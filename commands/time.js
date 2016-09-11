'use strict';

let unirest = require("unirest");
let cheerio = require('cheerio');


module.exports = {
    main: function(bot, msg, settings) {
        unirest.get("http://time.is/"+msg.content.replace(/^in/, ''))
        .end(res => {
            let $ = cheerio.load(res.body);
            msg.channel.sendMessage(`${$('#msgdiv > h1').text()} is ${$('#dd').text()}, ${$('#twd').text()}`);
        });
    },
    help: 'Get time of location',
    args: '<location>',
    catagory: 'general'
}
