const superagent = require('superagent');
const Entities = require('html-entities').XmlEntities;
const htmlDecode = new Entities().decode;

module.exports = {
  main: async (message) => {
    const client = message.client;
    client.log('DEFINE', message.content);
    const msg = await message.channel.send('**Opening Dictionary...**');
    superagent.get(`https://glosbe.com/gapi/translate?from=en&dest=en&format=json&phrase=${message.content}`)
      .then((res) => res.body)
      .then((res) => {
        if (!res.tuc) return Promise.reject();
        const final = [`**Definitions for __${message.content}__:**`];
        for (let [index, item] of Object.entries(res.tuc.filter(t => t.meanings)[0].meanings.slice(0, 5))) {
          item = client.util.bbcodeToMarkdown(htmlDecode(item.text.replace(/<\/?i>/g, '')));
          final.push(`**${(parseInt(index) + 1)}:** ${item}`);
        }
        return msg.edit(final);
      })
      .catch((err) => {
        client.error(err);
        msg.edit('**No results found!**');
      });
  },
  args: '<word>',
  help: 'Get a word definition.',
};
