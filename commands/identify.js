const axios = require('axios');

module.exports = {
  main: async message => {
    const client = message.client;
    client.log('IDENTIFY', message.guild.name, message.guild.id, message.content);
    const msg = await message.channel.sendMessage('`Identifying...`');
    let res = await axios.get('https://www.captionbot.ai/api/init');
    const cid = res.data;
    res = await axios.post('https://www.captionbot.ai/api/message',
      {'conversationId': cid, 'waterMark': '', 'userMessage': message.content.split(' ')[0]},
      { headers: {'Accept': 'application/json', 'Content-Type': 'application/json'} });
    res = await axios.get(`https://www.captionbot.ai/api/message?waterMark=&conversationId=${cid}`)
    msg.edit('**' + JSON.parse(res.data).BotMessages[1] + '**').catch(err => {
      client.error(err);
      msg.edit('**Could not identify image!**');
    });
  },
  help: 'Identify an image',
  args: '<url>',
  catagory: 'general'
};
