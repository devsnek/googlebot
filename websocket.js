const WebSocketServer = require('ws').Server;
const config = require('./config.json');

module.exports = (server, manager) => {
  const wss = new WebSocketServer({server: server});
  wss.counter = 0;
  wss.connections = [];
  wss.broadcast = (data) => {
    wss.connections.forEach(c => {
      if (c.readyState !== 1) return;
      c.send(s(3, data));
    });
  }

  const s = (op, data) => {
    wss.counter++;
    return JSON.stringify({ op: op, d: data, s: wss.counter });
  }

  wss.on('connection', ws => {
    const loginTimeout = setTimeout(() => {
      ws.close(4006, 'login timeout reached');
    }, 3000);

    ws.on('message', message => {
      try {
        if (JSON.parse(message).d === config.ws) {
          clearTimeout(loginTimeout);
          wss.connections.push(ws);
        }
      } catch (err) {}
    });

    ws.on('close', () => {
      let index = wss.connections.indexOf(ws);
      if (index === -1) return;
      wss.connections.splice(index, 1);
    });

    ws.send(s(0, 'ACK'));
  });
  return wss;
}
