const childProcess = require('child_process');
const raven = require('raven');
const request = require('snekfetch');
const logger = require('./Logger');

const config = require('../../config').sentry;

function getGlobalServer() {
  const d = raven.dsn;
  let globalServer = `//${d.host}${d.port ? `:${d.port}` : ''}`;
  if (d.protocol) return `${d.protocol}:${globalServer}`;
  return globalServer;
}

function makeReport(id, { name, email, comments }) {
  const url = `${getGlobalServer()}/api/embed/error-page/?eventId=${id}&dsn=${encodeURIComponent(raven.raw_dsn)}`;
  return request.post(url)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({ name, email, comments })
    .then((r) => r.body);
}

raven.config(config, {
  release: childProcess.execSync('git rev-parse HEAD').toString().trim(),
  environment: process.env.NODE_ENV,
}).install((err, sendErrFailed, eventId) => {
  if (sendErrFailed) {
    logger.error('SENTRY FAIL', eventId, err.stack);
  } else {
    logger.error('SENTRY', eventId);
  }
  process.exit(1);
});

module.exports = Object.assign(raven, {
  getGlobalServer,
  makeReport,
});
