const superagent = require('superagent');

module.exports = {
  main: async message => {
    const client = message.client;
    client.log('DEFINE', message.content);
    const msg = await message.channel.send('`Opening Dictionary...`');
    const url = `https://glosbe.com/gapi/translate?from=en&dest=en&format=json&phrase=${message.content}`;
    try {
      let res = await superagent.get(url);
      res = res.body;
      var final = [`**Definitions for __${message.content}__:**`];
      for (const [index, item] of Object.entries(res.tuc.filter(t => t.meanings)[0].meanings.slice(0, 5))) {
        final.push(`**${(parseInt(index) + 1)}:** ${item.text.replace(/<\/?i>/g, '_')}`);
      }
      msg.edit(final);
    } catch (err) {
      client.error(err.stack);
      msg.edit('`No results found!`');
    }
  },
  args: '<word>',
  help: 'Get a word definition.',
  catagory: 'general',
};
