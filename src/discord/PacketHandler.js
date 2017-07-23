const wrapMessage = require('./structures/Message');

function handle(client, ws, packet) {
  switch (packet.t) {
    case 'READY':
      return packet.d;
    case 'MESSAGE_CREATE':
      return wrapMessage(client, packet.d);
    default:
      return false;
  }
}

module.exports = handle;
