const Constants = require('../../Constants');
const querystring = require('querystring');
const snekfetch = require('snekfetch');

function request(client, method, path, options = {}) {
  const API = `${Constants.Http.API}/v${Constants.Http.VERSION}`;

  if (options.query) {
    const qs = (querystring.stringify(options.query).match(/[^=&?]+=[^=&?]+/g) || []).join('&');
    path += `?${qs}`;
  }

  return () => {
    const req = snekfetch[method](`${API}${path}`);

    req.set('Authorization', `Bot ${client.token}`);
    req.set('User-Agent', Constants.USER_AGENT);

    if (options.reason) req.set('X-Audit-Log-Reason', encodeURIComponent(options.reason));

    if (options.files) {
      for (const file of options.files) if (file && file.file) req.attach(file.name, file.file, file.name);
      if (typeof options.data !== 'undefined') req.attach('payload_json', JSON.stringify(options.data));
    } else if (typeof options.data !== 'undefined') {
      req.send(options.data);
    }

    return req;
  };
}

module.exports = request;
