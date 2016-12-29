const superagent = require('superagent');

module.exports = {
  main: async message => {
    let comicnum;
    if (isNaN(parseInt(message.content))) {
      let res = await superagent.get(`https://relevantxkcd.appspot.com/process?action=xkcd&query=${message.content}`)
      comicnum = res.text.split(' ')[2].replace('\n', '');
    } else {
      comicnum = parseInt(message.content);
    }
    const res = await superagent.get(`https://xkcd.com/${comicnum}/info.0.json`)
    let comic = res.body;
    let final = `XKCD ${comic.num} **${comic.safe_title}**
_*${comic.alt}*_
${comic.img}`;
    message.channel.send(final);
  },
  args: '<search>',
  help: 'find xkcd comic using search',
  catagory: 'general'
};
