const translate = require('google-translate-api');
const iso = require('iso-639-1').default;

const getISO = (x) => {
  x = x.toLowerCase();
  if (iso.getAllCodes().includes(x)) return x;
  return iso.getCode(x);
};

module.exports = {
  main: async (message) => {
    const args = message.content.split(' ');
    let to = getISO(args.pop());
    if (args[args.length - 1].toLowerCase() === 'to') args.pop();
    const toN = iso.getName(to);
    if (to === '') return message.channel.sendMessage('**`to` was not a real language!**');
    const msg = await message.channel.send('**Translating...**');
    translate(args.join(' '), { to: toN }).then(res =>
      msg.edit(`**__Translation__**\n\n**In:** \`${args.join(' ')}\` ${res.from.language.iso}\n\n**Out:** \`${res.text}\` ${toN} (${to})`))
    .catch((err) => {
      console.error(err);
      msg.edit('**Translation failed!**');
    });
  },
  help: 'Translate text.',
  args: '<something> <to lang>',
  usage: 'translate せんぱい en',
  catagory: 'general',
};
