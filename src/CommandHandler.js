const Collection = require('discord.js').Collection;
const fs = require('fs');
const path = require('path');

class CommandHandler extends Collection {
  constructor (client, dirname) {
    super();

    this.client = client;

    this.COMMAND_PATH = path.resolve(dirname, './commands');

    const files = fs.readdirSync(this.COMMAND_PATH);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const command = require(path.join(this.COMMAND_PATH, file));
        command.name = file.slice(0, -3);
        this.set(command.name, command);
        client.rethink.updateCommand(command);
      }
    }

    client.log('———— All Commands Loaded! ————');
  }
}

module.exports = CommandHandler;
