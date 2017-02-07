const superagent = require('superagent');

module.exports = {
  main: message => {
    const comicnum = parseInt(message.content);
    let request = superagent.get(`https://xkcd.com/${comicnum}/info.0.json`);
    if (isNaN(comicnum)) {
      if (message.content === 'latest') {
        request = superagent.get('https://xkcd.com/info.0.json');
      } else {
        request = superagent.get(`https://relevantxkcd.appspot.com/process?action=xkcd&query=${message.content}`)
          .then((res) => res.text.split(' ')[2].replace('\n', ''))
          .then((num) => superagent.get(`https://xkcd.com/${num}/info.0.json`));
      }
    }
    request.then((res) => res.body)
      .then((comic) => {
        message.channel.send(`XKCD ${comic.num} **${comic.safe_title}**\n_*${comic.alt}*_\n${comic.img}`);
      });
  },
  args: '<search|number>',
  help: 'find xkcd comic using search',
  catagory: 'general',
};
