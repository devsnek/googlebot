const superagent = require('superagent');

module.exports = {
  main: function(bot, msg, settings) {
    superagent.get('https://relevantxkcd.appspot.com/process?action=xkcd&query='+msg.content)
    .end((err, res) => {
      comicnum = res.text.split(' ')[2].replace('\n', '');
      superagent.get(`https://xkcd.com/${comicnum}/info.0.json`)
      .end((err, res) => {
        let comic = res.body;
        let final = `XKCD ${comic.num} **${comic.safe_title}**
_*${comic.alt}*_
${comic.img}`;
        msg.channel.sendMessage(final);
      });
    });
  },
  args: '<search>',
  help: "find xkcd comic using search"
};
