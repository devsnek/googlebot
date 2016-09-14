const unirest = require('unirest');

const rightpad = (v, n, c = '0') => String(v).length >= n ? '' + v : String(v) + String(c).repeat(n - String(v).length);

module.exports = {
  main: (bot, msg, settings) => {
    unirest.get('https://www.carbonitex.net/discord/api/listedbots')
    .end(res => {
      let chunks = [];
      let bots = res.body.sort((a, b) => b.servercount - a.servercount);
      bots.forEach(b => { // fuck you spoo.py
        if (b.name === '(ﾉ◕ヮ◕)ﾉ✧･ﾟ*✧spoo.py✧*･ﾟ✧ヽ(◕ヮ◕)ﾉ') b.name = 'spoo.py';
        return b
      })
      while (bots.length > 0) chunks.push(bots.splice(0, 10));
      let page = Math.min(Math.max(parseInt(msg.content), 1), chunks.length);
      msg.channel.sendCode('xl', `Page ${page}/${chunks.length}\n` + chunks[page-1].map(b => `${rightpad(b.name, 15, ' ')}${b.servercount} ${b.compliant ? 'Compliant' : ''}`).join('\n'));
    })
  },
  help: 'Grab the botlist from carbonitex',
  args: '<page>',
  catagory: 'util'
}
