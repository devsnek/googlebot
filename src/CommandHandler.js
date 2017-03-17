const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const EventCounter = require('./util/EventCounter');

class CommandHandler extends Collection {
  constructor(client, dirname) {
    super();

    this.COMMAND_PATH = path.resolve(dirname, './commands');

    const files = fs.readdirSync(this.COMMAND_PATH);
    for (const file of files) if (file.endsWith('.js')) this.load(file);

    this.eventCounter = new EventCounter();

    client.log('———— All Commands Loaded! ————');
  }

  load(file) {
    const command = require(path.join(this.COMMAND_PATH, file));
    command.name = file.slice(0, -3);
    command.example = command.usage ? `@Google ${command.usage}` : null;
    command.usage = `@Google ${command.name} ${command.args || ''}`.trim();
    this.set(command.name, command);
  }

  reload(command) {
    try {
      this.delete(command);
      const pth = require.resolve(path.join(this.COMMAND_PATH, `${command}.js`));
      delete require.cache[pth];
      this.load(`${command}.js`);
    } catch (err) {
      console.error(err);
    }
  }

  get(name) {
    if (this.has(name)) this.eventCounter.trigger(name);
    else this.eventCounter.trigger('invalid');
    return super.get(name);
  }
}

module.exports = CommandHandler;
