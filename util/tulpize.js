const SCARY = ['110373943822540800'];

const START = /^\/\/|^["{\[~-] ?/g;
const END = / ?["\]}~-]$/g;

module.exports = (message) => {
  if (SCARY.includes(message.guild.id)) return [message.content, message.cleanContent];
  const x = [];
  for (let c of [message.content, message.cleanContent]) {
    if (START.test(c)) {
      c = c.replace(START, '');
      if (END.test(c)) {
        c = c.replace(END, '')
      }
    }
    x.push(c);
  }
  return x;
}
