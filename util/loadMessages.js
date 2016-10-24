const fs = require('fs');
const path = require('path');

module.exports = (client, dirname) => {
  const files = fs.readdirSync(path.join(dirname, 'messages'));
  for (let file of files) {
    if (file.endsWith('.js')) {
      client.messages[file.slice(0, -3)] = fs.readFileSync(path.join(dirname, 'messages', file));
    }
  }
  client.log('———— All Messages Loaded! ————');
}
