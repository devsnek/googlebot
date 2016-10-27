const superagent = require('superagent');

module.exports = {
  main: async message => {
    const client = message.client;
    client.log('IDENTIFY', message.guild.name, message.guild.id, message.content);
    const msg = await message.channel.sendMessage('`Identifying...`');
    let res = await superagent.get('https://www.captionbot.ai/api/init');
    const cid = res.body;
    res = await superagent.post('https://www.captionbot.ai/api/message')
      .set({'Accept': 'application/json', 'Content-Type': 'application/json'})
      .send({'conversationId': cid, 'waterMark': '', 'userMessage': message.content.split(' ')[0]});
    res = await superagent.get(`https://www.captionbot.ai/api/message?waterMark=&conversationId=${cid}`)
    msg.edit('**' + res.body.BotMessages[1] + '**').catch(err => {
      client.error(err);
      msg.edit('**Could not identify image!**');
    });
  },
  help: 'Identify an image',
  args: '<url>',
  catagory: 'general'
};
