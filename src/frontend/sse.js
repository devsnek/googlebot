const SSE = require('sse');

module.exports = (frontend) => {
  const sse = new SSE(frontend.server, {
    path: '/events',
    headers: {
      'X-Powered-By': 'Hard work, dammit!',
    },
  });

  sse.broadcast = (...args) => {
    for (const client of sse.clients) client.send(...args);
  };

  return sse;
};
