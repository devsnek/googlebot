const superagent = require('superagent');

module.exports = {
  main: async (message) => {
    const msg = await message.channel.sendMessage('`Searching...`')
    let res = await superagent.get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srwhat=text&srprop=sectionsnippet&format=json&srsearch=${message.content}`);
    const results = res.body.query.search;
    if (!results[0]) return msg.edit('`No results found!`');
    res = await superagent.get(`https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=${encodeURIComponent(results[0].title)}`);
    const page = res.body.query.pages[Object.keys(res.body.query.pages)];
    const url = `https://wikipedia.org/wiki/${encodeURIComponent(page.title)}`;
    const embed = message.client.util.embed(url, page.title, page.extract.substring(0, 500) + `... [Read more](${url})`);
    msg.edit('', { embed });
  }
}
