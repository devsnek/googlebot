const config = require('../../config.json');
const WebSocketServer = require('ws').Server;

module.exports = (server) => {
  const wss = new WebSocketServer({server: server});
  wss.counter = 0;
  wss.connections = [];
  wss.broadcast = (data) => {
    for (const c of wss.connections) {
      if (c.readyState === 1) c.send(s(3, data));
    }
  }

  const s = (op, data) => {
    return JSON.stringify({ op, d: data, s: ++wss.counter });
  }

  wss.on('connection', ws => {
    const loginTimeout = setTimeout(() => {
      ws.close(4006, 'login timeout reached');
    }, 3000);

    ws.on('message', message => {
      try {
        let data = JSON.parse(message);
        if (data.d === config.ws) {
          clearTimeout(loginTimeout);
          wss.connections.push(ws);
        } else if (data.op === 42) {
          if (wss.connections.indexOf(ws) < 0) return;
          ws.send(JSON.stringify({op: 84, d: eval(data.d)})); // eslint-disable-line no-eval
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
