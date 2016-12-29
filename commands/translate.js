const superagent = require('superagent');
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
    let from = getISO(args.pop());
    const toN = iso.getName(to);
    const fromN = iso.getName(from);
    if (to === '' || from === '') return message.channel.sendMessage('`to` or `from` were not real languages!');
    const url = `https://glosbe.com/gapi/translate?from=${from}&dest=${to}&format=json&phrase=${args.join(' ')}`;
    const res = await superagent.get(url);
    if (res.body.tuc.length === 0) return message.channel.sendMessage(`**Could not translate** \`${args.join(' ')}\` from \`${fromN}\` to \`${toN}\``);
    const translated = res.body.tuc[0].phrase.text;
    message.channel.send(`**__Translation__**\n\n**In:** \`${args.join(' ')}\` ${fromN} (${from})\n\n**Out:** \`${translated}\` ${toN} (${to})`);
  },
  help: 'Translate text.',
  args: '<sentence> <from lang> <to lang>',
  catagory: 'general'
};
