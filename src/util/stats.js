const StatsD = require('hot-shots');

const logger = require('./Logger');
const config = require('../../config.json').statsd;

const client = new StatsD({
  host: config.host,
  port: config.port,
  prefix: `${config.prefix}.${process.env.NODE_ENV}.`,
  errorHandler(error) {
    logger.error('STATSD ERROR', error.stack);
  },
});

module.exports = client;
