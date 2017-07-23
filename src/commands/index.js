const fs = require('fs');
const path = require('path');

const commands = module.exports = {};

const COMMAND_PATH = __dirname;

function requireSingleFile(filename) {
  const p = path.join(COMMAND_PATH, filename);
  delete require.cache[require.resolve(p)];
  const entry = require(p);
  commands[entry.name] = entry;
}

function load(filename) {
  if (filename) {
    try {
      requireSingleFile(filename);
      // updated
    } catch (err) {
      // deleted
    }
  } else {
    const files = fs.readdirSync(COMMAND_PATH);
    for (const file of files) {
      if (!file.endsWith('.js') || file === 'index.js') continue;
      requireSingleFile(file);
    }
  }
}

load();

fs.watch(COMMAND_PATH, {
  recursive: true,
  persistant: false,
}, load);
