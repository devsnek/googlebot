const superagent = require('superagent');

const shortenTitle = string => string.length > 40 ? string.substring(0, 40) + '...' : string;

module.exports = {
  main: async message => {
    try {
      const res = await superagent.post('https://qeeqle.gus.host').send({query: message.content});
      const final = res.body.slice(0, 5).map((r, i) => `${i + 1}. (${r.rating} ⭐) ${shortenTitle(r.title)}\n${r.link}`).join('\n');
      message.channel.sendCode('xl', final);
    } catch (err) {
      message.channel.sendMessage(`No results found!`);
    }
  },
  help: 'Find anime from the internet',
  args: '<query>',
  catagory: 'general'
}
