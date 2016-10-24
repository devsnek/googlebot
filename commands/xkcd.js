const axios = require('axios');

module.exports = {
  main: async message => {
    let res = await axios.get(`https://relevantxkcd.appspot.com/process?action=xkcd&query=${message.content}`)
    const comicnum = res.data.split(' ')[2].replace('\n', '');
    res = await axios.get(`https://xkcd.com/${comicnum}/info.0.json`)
    let comic = res.data;
    let final = `XKCD ${comic.num} **${comic.safe_title}**
_*${comic.alt}*_
${comic.img}`;
    message.channel.sendMessage(final);
  },
  args: '<search>',
  help: 'find xkcd comic using search',
  catagory: 'general'
};
