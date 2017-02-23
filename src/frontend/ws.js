const WebSocketServer = require('ws').Server;

module.exports = (frontend) => {
  const wss = new WebSocketServer({ server: frontend.server });
  wss.counter = 0;
  wss.connections = [];
  wss.broadcast = (data) => {
    for (const c of wss.connections) if (c.readyState === 1) c.send(s(3, data));
  };

  const s = (op, data) => JSON.stringify({ op, d: data, s: ++wss.counter });

  wss.on('connection', ws => {
    wss.connections.push(ws);
    ws.on('close', () => {
      const index = wss.connections.indexOf(ws);
      if (index !== -1) wss.connections.splice(index, 1);
    });

    // const loginTimeout = setTimeout(() => {
    //   ws.close(4006, 'login timeout reached');
    // }, 3000);

    // ws.on('message', message => {
    //   try {
    //     let data = JSON.parse(message);
    //     if (data.d === config.ws) {
    //       clearTimeout(loginTimeout);
    //       wss.connections.push(ws);
    //     }
    //   } catch (err) {
    //     ws.close(1000, 'wtf is wrong with you?');
    //   } // eslint-disable-line no-empty
    // });

    ws.send(s(0, 'ACK'));
  });
  return wss;
};
