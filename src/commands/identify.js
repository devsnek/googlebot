const superagent = require('superagent');

module.exports = {
  main: async message => {
    const client = message.client;
    client.log('IDENTIFY', message.guild.name, message.guild.id, message.content);
    const msg = await message.channel.send('**Identifying...**');
    return superagent.get('https://www.captionbot.ai/api/init')
    .then((res) => {
      const conversationId = res.body
        .replace('<string xmlns="http://schemas.microsoft.com/2003/10/Serialization/">', '')
        .replace('</string>', '');
      return superagent.post('https://www.captionbot.ai/api/message')
        .set({ Accept: 'application/json', 'Content-Type': 'application/json' })
        .send({ conversationId, waterMark: '', userMessage: message.content.replace(/<|>/g, '') })
        .then(() => conversationId);
    })
    .then((cid) => superagent.get(`https://www.captionbot.ai/api/message?waterMark=&conversationId=${cid}`))
    .then((res) => msg.edit(`**${JSON.parse(res.body).BotMessages[1]}**`))
    .catch((err) => {
      client.error(err);
      msg.edit('**Could not identify image!**');
    });
  },
  help: 'Identify an image',
  args: '<url>',
  catagory: 'general',
};
