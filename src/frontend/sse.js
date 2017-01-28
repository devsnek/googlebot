const SSE = require('sse');

module.exports = (server) => {
  const sse = new SSE(server, {
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
