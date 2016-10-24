const chalk = require('chalk');

module.exports = client => {
  client.log = (...args) => console.log('🔧', chalk.green.bold(`SHARD ${client.shard.id + 1}`), ...args);
  client.error = (...args) => console.error(chalk.bgRed.white.bold(`🔥  SHARD ${client.shard.id + 1}`), ...args);
}
