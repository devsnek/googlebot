const Package = require('../package.json');

exports.Http = {
  VERSION: 7,
  API: 'https://discordapp.com/api',
};

exports.USER_AGENT = `DiscordBot (${Package.homepage}, ${Package.version})`;
