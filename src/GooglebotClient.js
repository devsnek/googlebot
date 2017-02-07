const Discord = require('discord.js');
const KeyManager = require('./util/KeyManager');
const config = require('../config.json');
const chalk = require('chalk');
const CommandHandler = require('./CommandHandler');
const gist = require('gist');
const shorten = require('./util/ShortenURL');

// kill me
for (const channel of [
  Discord.TextChannel,
  Discord.DMChannel,
  Discord.GroupDMChannel,
]) {
  channel.prototype._send = channel.prototype.send;
  Object.defineProperty(channel.prototype, 'send', {
    value: function value(content, options) {
      if (typeof content === 'string' && content.length >= 2000) {
        return gist([{ name: 'message.txt', content }], { private: false })
          .then(res => shorten(res.html_url))
          .then(x => this._send(`This response was over 2000 characters and has been uploaded here: ${x}`));
      } else {
        return this._send(content, options);
      }
    },
  });
}

class GooglebotClient extends Discord.Client {
  constructor() {
    super({
      fetchAllUsers: true,
      messageCacheMaxSize: 1,
      disableEveryone: true,
      disabledEvents: [
        'PRESENCE_UPDATE',
        'TYPING_START',
        'VOICE_STATE_UPDATE',
        'FRIEND_ADD',
        'FRIEND_REMOVE',
      ],
      shardCount: config.discord.SHARD_COUNT,
    });

    this.config = config;

    this.util = {
      keys: new KeyManager(),
      embed: require('./util/embed'),
      isStaff: require('./util/isStaff'),
      toHHMMSS: require('./util/toHHMMSS'),
      pad: require('./util/pad'),
      shorten,
    };

    require('./util/loadEvents')(this);

    this.eventCounter = {
      FREQUENCY: 0,
      TOTAL: 0,
    };

    let start = 0;

    this.on('raw', (packet) => {
      if (!this.eventCounter[packet.t]) this.eventCounter[packet.t] = 0;
      this.eventCounter[packet.t]++;

      if (!start) start = new Date;
      this.eventCounter.FREQUENCY = ++this.eventCounter.TOTAL / (new Date - start) * 1000;

      // race conditions you say?
      if (packet.t === 'READY') {
        this.prefixes = config.prefixes.map(p => p.replace('{ID}', packet.d.user.id));
        this.prefix = new RegExp(`^${this.prefixes.join('|^')}`, 'i');
      }
    });

    this.commands = new CommandHandler(this, __dirname);
  }

  login() {
    return super.login(config.discord.TOKENS[config.env]);
  }

  log(...args) {
    console.log('🔧', chalk.green.bold(`INFO`), ...args);
  }

  error(...args) {
    console.error(chalk.bgRed.white.bold(`🔥  ERROR`), ...args);
  }
}

module.exports = GooglebotClient;
