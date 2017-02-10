const raven = require('raven');

function sendRavenFeedback(eventID, DSN, body) {
  const superagent = require('superagent');
  function getGlobalServer(uri) {
    let globalServer = `//${uri.host}${uri.port ? `:${uri.port}` : ''}`;
    if (uri.protocol) globalServer = `${uri.protocol}:${globalServer}`;
    return globalServer;
  }

  function parseDSN(str) {
    const PATTERN = /^(?:(\w+):)?\/\/(?:(\w+)(:\w+)?@)?([\w.-]+)(?::(\d+))?(\/.*)/;
    const KEYS = ['source', 'protocol', 'user', 'pass', 'host', 'port', 'path'];
    const m = PATTERN.exec(str);
    const dsn = {};
    let i = 7;
    try {
      while (i--) dsn[KEYS[i]] = m[i] || '';
    } catch (e) {
      throw new Error(`Invalid DSN: ${str}`);
    }
    return dsn;
  }

  const globalServer = getGlobalServer(parseDSN(DSN));
  const path = `/api/embed/error-page/?eventId=${encodeURIComponent(eventID)}&dsn=${encodeURIComponent(DSN)}`;
  const URL = `${globalServer}${path}`;
  return superagent.post(URL)
    .type('form')
    .send(body);
}

raven.sendFeedback = sendRavenFeedback;

module.exports = raven;
