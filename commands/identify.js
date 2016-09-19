const unirest = require('unirest');

module.exports = {
  main: (bot, msg, settings) => {
    var args = msg.content;
    bot.log('IDENTIFY', msg.guild.name, msg.guild.id, args);

    msg.channel.sendMessage('`Identifying...`').then(message => {
      settings.toBeDeleted.set(msg.id, message.id);
      unirest.get('https://www.captionbot.ai/api/init')
      .end(res => {
        var cid = res.body;
        unirest.post('https://www.captionbot.ai/api/message')
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send({'conversationId': cid, 'waterMark': '', 'userMessage': args.split(' ')[0]})
        .end(res => {
          unirest.get('https://www.captionbot.ai/api/message?waterMark=&conversationId=' + cid)
          .end(res => {
            // bot.log('Identify: ', msg.guild.name, msg.guild.id, '|', args, '|', cid);
            message.edit('**' + JSON.parse(res.body).BotMessages[1] + '**').catch(err => {
              bot.error(err);
              message.edit('**Could not identify image!**');
            });
          });
        });
      });
    });
  },
  help: 'Identify an image',
  args: '<url>',
  catagory: 'general'
};

