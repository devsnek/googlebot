const Constants = require('../../Constants');
const Package = require('../../../package.json');
const querystring = require('querystring');
const snekfetch = require('snekfetch');

function request(client, method, path, options = {}) {
  const API = `${Constants.Http.API}/v${Constants.Http.VERSION}`;

  if (options.query) {
    const queryString = (querystring.stringify(options.query).match(/[^=&?]+=[^=&?]+/g) || []).join('&');
    path += `?${queryString}`;
  }

  const request = snekfetch[method](`${API}${path}`);

  request.set('Authorization', `Bot ${client.token}`);
  request.set('User-Agent', `DiscordBot (${Package.homepage.split('#')[0]}, ${Package.version})`);

  if (options.reason) request.set('X-Audit-Log-Reason', encodeURIComponent(options.reason));

  if (options.files) {
    for (const file of options.files) if (file && file.file) request.attach(file.name, file.file, file.name);
    if (typeof options.data !== 'undefined') request.attach('payload_json', JSON.stringify(options.data));
  } else if (typeof options.data !== 'undefined') {
    request.send(options.data);
  }
  return request.then(r => r.body);
}

module.exports = request;
