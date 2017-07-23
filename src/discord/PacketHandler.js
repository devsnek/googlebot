const Message = require('./structures/Message');

function handle(client, ws, packet) {
  switch (packet.t) {
    case 'READY':
      return packet.d;
    case 'MESSAGE_CREATE':
      return new Message(client, packet.d);
    default:
      return false;
  }
}

module.exports = handle;
