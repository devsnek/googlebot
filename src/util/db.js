const logger = require('./Logger');
const rethink = require('rethinkdbdash');

const config = require('../../config').db;

const r = rethink({
  pool: false,
  cursor: true,
  silent: true,
  port: config.port,
  host: config.host,
  user: config.username,
  password: config.username,
  log: (message) => {
    logger.log('RETHINK', message);
  },
});

module.exports = r;
