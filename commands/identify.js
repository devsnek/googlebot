const axios = require('axios');

module.exports = {
  main: async (bot, msg, settings) => {
    var args = msg.content;
    bot.log('IDENTIFY', msg.guild.name, msg.guild.id, args);
    const message = msg.channel.sendMessage('`Identifying...`');
    settings.toBeDeleted.set(msg.id, message.id);
    let res = await axios.get('https://www.captionbot.ai/api/init');
    const cid = res.body;
    res = await axios.post('https://www.captionbot.ai/api/message',
      {'conversationId': cid, 'waterMark': '', 'userMessage': args.split(' ')[0]},
      { headers: {'Accept': 'application/json', 'Content-Type': 'application/json'} });
    res = await axios.get(`https://www.captionbot.ai/api/message?waterMark=&conversationId=${cid}`)
    message.edit('**' + JSON.parse(res.body).BotMessages[1] + '**').catch(err => {
      bot.error(err);
      message.edit('**Could not identify image!**');
    });
  },
  help: 'Identify an image',
  args: '<url>',
  catagory: 'general'
};
