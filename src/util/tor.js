const Socks = require('socks');
const net = require('net');

const config = require('../../config');

function createAgent(url) {
  return new Socks.Agent({
    proxy: {
      ipaddress: 'localhost',
      port: 9050,
      type: 5,
    },
  }, url.startsWith('https'), false);
}


function torCommand(commands) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({
      host: 'localhost',
      port: 9050,
    }, () => {
      socket.write(commands.join('\n'));
    });

    socket.on('error', reject);

    const chunks = [];
    socket.on('data', (chunk) => chunks.push(chunk));

    socket.on('end', () => {
      const res = Buffer.concat(chunks).toString();
      for (const item of res.split(/(\r)?\n/)) {
        if (item.length > 0 && !item.includes('250')) return reject(new Error(res));
      }
      resolve(res);
    });
  });
}

function renewSession() {
  const commands = [
    `authenticate "${config.tor.password}"`,
    'signal newnym',
    'quit',
  ];
  return torCommand(commands);
}

module.exports = {
  createAgent,
  torCommand,
  renewSession,
};
