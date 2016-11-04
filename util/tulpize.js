const START = /^\/\/ ?|^["{[~-] ?/g;
const END = / ?["\]}~-]$/g;

module.exports = (message) => {
  const x = [];
  for (let c of [message.content, message.cleanContent]) {
    if (START.test(c)) {
      c = c.replace(START, '');
      if (END.test(c)) {
        c = c.replace(END, '')
      }
    }
    x.push(c.trim());
  }
  return x;
}
