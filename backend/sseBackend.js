const SSE = require('sse');

module.exports = (server, app) => {
  const sse = new SSE(server, {
    path: '/events',
    headers: {
      'X-Powered-By': 'Hard work, dammit!'
    }
  });

  sse.on('connection', client => {
    // client.send('ACK', JSON.stringify({
    //   wss: 'wss://google.gus.host',
    //   current: app.manager.stats
    // }));
    client.send('stats', JSON.stringify(app.manager.stats));
  });

  sse.broadcast = (...args) => {
    for (const client of sse.clients) client.send(...args);
  }

  return sse;
}
