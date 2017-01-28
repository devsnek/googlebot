const fs = require('fs');
const path = require('path');

class KeyManager {
  constructor() {
    this.KEYS = fs.readFileSync(path.resolve('keys.txt')).toString().split('\n');
    this.KEYS.pop();
    this.last = 0;
  }

  get nextKey() {
    this.last++;
    if (this.last > this.KEYS.length) this.last = 0;
    return this.KEYS[this.last];
  }
}

module.exports = KeyManager;
