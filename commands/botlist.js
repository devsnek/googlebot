const unirest = require('unirest');

const rightpad = (v, n, c = '0') => String(v).length >= n ? '' + v : String(v) + String(c).repeat(n - String(v).length);

module.exports = {
  main: function (bot, msg, settings) {
    unirest.get('https://www.carbonitex.net/discord/api/listedbots')
    .end(res => {
      let chunks = [];
      let bots = res.body.sort((a, b) => b.servercount - a.servercount);
      bots.forEach(b => { // fuck you spoo.py
        if (b.name === '(ﾉ◕ヮ◕)ﾉ✧･ﾟ*✧spoo.py✧*･ﾟ✧ヽ(◕ヮ◕)ﾉ') b.name = 'spoo.py';
        return b
      })
      while (bots.length > 0) chunks.push(bots.splice(0, 10));
      msg.channel.sendMessage('```xl\n' + chunks[parseInt(msg.content) - 1].map(b => `${rightpad(b.name, 15, ' ')}${b.servercount} ${b.compliant ? 'Compliant' : ''}`).join('\n') + '\n```');
    })
  }
}

