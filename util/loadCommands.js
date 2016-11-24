const fs = require('fs');
const path = require('path');

module.exports = client => {
  const files = fs.readdirSync(path.resolve('./commands'));
  for (const file of files) {
    if (file.endsWith('.js')) {
      const command = client.commands[file.slice(0, -3)] = require(path.join('../', 'commands', file));
      command.name = file.slice(0, -3);
      client.rethink.updateCommand(command);
    }
  }
  client.log('———— All Commands Loaded! ————');
}
