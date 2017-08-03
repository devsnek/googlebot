const raven = require('raven');
const request = require('snekfetch');

function getGlobalServer() {
  const d = raven.dsn;
  let globalServer = `//${d.host}${d.port ? `:${d.port}` : ''}`;
  if (d.protocol) return `${d.protocol}:${globalServer}`;
  return globalServer;
}

function makeReport(id, { name, email, comments }) {
  const url = `${getGlobalServer()}/api/embed/error-page/?eventId=${id}&dsn=${encodeURIComponent(raven.raw_dsn)}`;
  return request.post(url)
    .set({
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://google.gus.host',
    })
    .send({ name, email, comments })
    .then((r) => r.body);
}

module.exports = (token) => {
  raven.config(token).install();
  return Object.assign(raven, {
    getGlobalServer,
    makeReport,
  });
};
