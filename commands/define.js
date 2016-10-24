const axios = require('axios');

module.exports = {
  main: async message => {
    const client = message.client;
    client.log('DEFINE', message.content);
    const msg = await message.channel.sendMessage('`Opening Dictionary...`');
    const url = `https://wordsapiv1.p.mashape.com/words/${msg.content}`
    var headers = {'X-Mashape-Key': client.config.wordsApi, 'Accept': 'application/json'}
    let res = await axios.get(url, {headers: headers});
    res = res.data;
    var final = '';
    try {
      for (const item in res.results) {
        final += (parseInt(item) + 1) + ': ' + res.results[item].definition + '\n'
      }
      msg.edit('```xl\nDefinitions for ' + message.content + ':\n' + final + '\n```');
    } catch (err) {
      msg.edit('`No results found!`');
    }
  },
  args: '<word>',
  help: 'Get a word definition.',
  catagory: 'general'
};
