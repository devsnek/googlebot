const fs = require('fs');
const path = require('path');

const KEYS = module.exports.KEYS = fs.readFileSync(path.resolve('keys.txt')).toString().split('\n').slice(-1, 1);

let lastKey = module.exports.lastKey = 0;

module.exports.getKey = () => {
  lastKey++;
  if (lastKey > KEYS.length) lastKey = 0;
  return KEYS[lastKey];
}
