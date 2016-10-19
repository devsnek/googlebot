const axios = require('axios');

module.exports = {
  main: async (bot, msg, settings) => {
    bot.log('DEFINE', msg.content);
    const message = await msg.channel.sendMessage('`Opening Dictionary...`');
    const url = `https://wordsapiv1.p.mashape.com/words/${msg.content}`
    var headers = {'X-Mashape-Key': settings.config.wordsApi, 'Accept': 'application/json'}
    let res = await axios.get(url, {headers: headers});
    res = res.data;
    var final = '';
    try {
      for (const item in res.results) {
        final += (parseInt(item) + 1) + ': ' + res.results[item].definition + '\n'
      }
      message.edit('```xl\nDefinitions for ' + msg.content + ':\n' + final + '\n```');
    } catch (err) {
      message.edit('`No results found!`');
    }
    settings.toBeDeleted.set(msg.id, message.id);
  },
  args: '<word>',
  help: 'Get a word definition.',
  catagory: 'general'
};
