const superagent = require('superagent');

module.exports = {
  main: (message) => {
    message.channel.send('**Searching...**')
      .then((msg) => {
        superagent.get(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srwhat=text&srprop=sectionsnippet&format=json&srsearch=${message.content}`
        )
        .then((res) => res.body.query.search)
        .then((results) => {
          if (!results[0]) return Promise.reject('NO RESULTS');
          return results[0];
        })
        .then((result) => superagent.get(
          `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=${encodeURIComponent(result.title)}`
        ))
        .then((res) => res.body.query.pages[Object.keys(res.body.query.pages)])
        .then((page) => {
          const url = `https://wikipedia.org/wiki/${encodeURIComponent(page.title)}`;
          return message.client.util.embed(url, page.title, `${page.extract.substring(0, 500)}... [Read more](${url.replace(/\(/, '%28').replace(/\)/, '%29')})`);
        })
        .then((embed) => msg.edit({ embed }))
        .catch((err) => {
          message.client.error(err);
          msg.edit('**No results found!**');
        });
      });
  },
  help: 'search wikipedia',
  args: '<query>',
};
