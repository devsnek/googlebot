const fs = require('fs');
const path = require('path');
const logger = require('../util/Logger');

module.exports = {};

const COMMAND_PATH = __dirname;

function requireSingleFile(filename) {
  const p = path.join(COMMAND_PATH, filename);
  delete require.cache[require.resolve(p)];
  const entry = require(p);
  module.exports[entry.name] = entry;
}

function load(filename) {
  if (filename) {
    try {
      requireSingleFile(filename);
      logger.log('COMMAND UPDATED', filename);
    } catch (err) {
      const p = path.join(COMMAND_PATH, filename);
      delete require.cache[require.resolve(p)];
      delete module.exports[filename.split('.')[0]];
      logger.log('COMMAND DELETED', filename);
    }
  } else {
    const files = fs.readdirSync(COMMAND_PATH);
    for (const file of files) {
      if (!file.endsWith('.js') || file === 'index.js') continue;
      requireSingleFile(file);
      logger.log('COMMAND LOADED', file);
    }
  }
}

load();

fs.watch(COMMAND_PATH, {
  recursive: true,
  persistant: false,
}, (_, filename) => load(filename));
