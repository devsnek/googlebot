const START = /^\/\/|^["{\[~-] ?/g;
const END = / ?["\]}~-]$/g;

if (!Reflect.has(Array.prototype, 'last')) {
  Object.defineProperty(Array.prototype, 'last', { // eslint-disable-line
    get: function () {
      return this[this.length - 1];
    }
  });
}

module.exports = (message) => {
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
