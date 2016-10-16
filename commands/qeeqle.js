const superagent = require('superagent');

const shortenTitle = string => string.length > 40 ? string.substring(0, 40) + '...' : string;

module.exports = {
  main: (bot, msg, settings) => {
    superagent.post('https://qeeqle.guscaplan.me')
    .send(JSON.stringify({'query': msg.content}))
    .end((err, res) => {
      if (err) return msg.channel.sendMessage(`No results found!`)
      let final = res.body.slice(0, 5).map((r, i) => {
        return `${i + 1}. (${r.rating} ⭐) ${shortenTitle(r.title)}
     ${r.link}`
      }).join('\n');

      msg.channel.sendMessage('```xl\n' + final + '\n```');
    });
  },
  help: 'Find anime from the internet',
  args: '<query>',
  catagory: 'general'
}
