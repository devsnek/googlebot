const superagent = require('superagent');

module.exports = {
  main: (message) => {
    const { left, right } = message.client.util.pad;
    superagent.get('https://www.carbonitex.net/discord/api/listedbots')
      .then((res) => res.body
        .sort((a, b) => b.servercount - a.servercount)
        .filter(b => b.servercount !== '0' && b.botid > 10)
        .map(b => {
          b.name = b.name.replace(/[^a-z0-9]/gmi, '').replace(/\s+/g, '');
          return b;
        }))
      .then((bots) => {
        const chunks = [];
        while (bots.length > 0) chunks.push(bots.splice(0, 10));
        const page = Math.min(Math.max(parseInt(message.content), 1), chunks.length) || 1;
        return `Page ${page}/${chunks.length}\n${chunks[page - 1].map((b, i) => `${left(((page - 1) * 10) + (i + 1), 2)}) ${right(b.name, 20)}${b.servercount} ${b.compliant === 1 ? 'Compliant' : ''}`).join('\n')}`;
      })
      .then((content) => message.channel.send(content, { code: 'xl' }));
  },
  help: 'Grab the botlist from carbonitex',
  args: '<page>',
  catagory: 'util',
};
