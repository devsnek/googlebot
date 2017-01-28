const superagent = require('superagent');

module.exports = {
  main: async message => {
    const { left, right } = message.client.util.pad;
    const res = await superagent.get('https://www.carbonitex.net/discord/api/listedbots');
    let chunks = [];
    let bots = res.body.sort((a, b) => b.servercount - a.servercount);
    bots = bots.filter(b => b.servercount !== '0' && b.botid > 10);
    bots = bots.map(b => {
      b.name = b.name.replace(/[^a-z0-9]/gmi, '').replace(/\s+/g, '');
      return b;
    });
    while (bots.length > 0) chunks.push(bots.splice(0, 10));
    let page = Math.min(Math.max(parseInt(message.content), 1), chunks.length) || 1;
    message.channel.send(`Page ${page}/${chunks.length}\n${chunks[page - 1].map((b, i) => `${left(((page - 1) * 10) + (i + 1), 2)}) ${right(b.name, 20)}${b.servercount} ${b.compliant === 1 ? 'Compliant' : ''}`).join('\n')}`, { code: 'xl' });
  },
  help: 'Grab the botlist from carbonitex',
  args: '<page>',
  catagory: 'util',
};
