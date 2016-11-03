const fs = require('fs');
const path = require('path');

const KEYS = fs.readFileSync(path.resolve('keys.txt')).toString().split('\n');
KEYS.pop();
module.exports.KEYS = KEYS;

let lastKey = module.exports.lastKey = 0;

module.exports.getKey = () => {
  lastKey++;
  if (lastKey > KEYS.length) lastKey = 0;
  return KEYS[lastKey];
}
