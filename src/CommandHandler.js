const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const EventCounter = require('./util/EventCounter');

class CommandHandler extends Collection {
  constructor(client, dirname) {
    super();

    this.COMMAND_PATH = path.resolve(dirname, './commands');

    const files = fs.readdirSync(this.COMMAND_PATH);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const command = require(path.join(this.COMMAND_PATH, file));
        command.name = file.slice(0, -3);
        command.example = `@Google ${command.usage}`;
        command.usage = `@Google ${command.name} ${command.args || ''}`.trim();
        this.set(command.name, command);
      }
    }

    this.eventCounter = new EventCounter();

    client.log('———— All Commands Loaded! ————');
  }
}

module.exports = CommandHandler;
