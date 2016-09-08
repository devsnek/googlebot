const unirest = require('unirest');

function shortenTitle (string) {
  return string.length > 40 ? string.substring(0, 40) + '...' : string;
}

module.exports = {
  main: function(bot, msg, settings) {
    unirest.post('https://qeeqle.guscaplan.me')
    .send(JSON.stringify({"query": msg.content}))
    .end(res => {
      if (res.body.errorMessage) {
        msg.channel.sendMessage(`No results found!`)
      } else {
        let final = res.body.slice(0, 5).map((r, i) => {
          return `${i + 1}. (${r.rating} ⭐) ${shortenTitle(r.title)}
       ${r.link}`
        }).join('\n');

        msg.channel.sendMessage('```xl\n' + final + '\n```');
      }
    });
  }
}
