const superagent = require('superagent');

module.exports = {
  main: message => {
    const client = message.client;
    client.log('DEFINE', message.content);
    message.channel.send('**Opening Dictionary...**')
      .then((msg) => {
        superagent.get(`https://glosbe.com/gapi/translate?from=en&dest=en&format=json&phrase=${message.content}`)
          .then((res) => res.body)
          .then((res) => {
            if (res.tuc == undefined) {
              msg.edit('**No results found!**')
              return;
            }
            const final = [`**Definitions for __${message.content}__:**`];
            for (let [index, item] of Object.entries(res.tuc.filter(t => t.meanings)[0].meanings.slice(0, 5))) {
              item = item.text
                .replace(/\[(\w+)[^\]]*](.*?)\[\/\1]/g, '_')
                .replace(/<i>|<\/i>/g, '');
              final.push(`**${(parseInt(index) + 1)}:** ${item}`);
            }
            return msg.edit(final);
          })
          .catch((err) => {
            client.error(err);
            msg.edit('**No results found!**');
          });
      });
  },
  args: '<word>',
  help: 'Get a word definition.',
};
