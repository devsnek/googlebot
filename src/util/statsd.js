const StatsD = require('hot-shots');

const logger = require('./Logger');
const config = require('../../config.json');

const client = new StatsD(config.statsd);

client.socket.on('error', (err) => {
  logger.error('STATSD ERROR ', err.stack);
});

module.exports = client;
