const StatsD = require('hot-shots');

const logger = require('./Logger');
const config = require('../../config.json');

const client = new StatsD(Object.assign({
  errorHandler(error) {
    logger.error('STATSD ERROR', error.stack);
  },
}, config.statsd));

module.exports = client;
