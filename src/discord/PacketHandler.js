const Message = require('./structures/Message');

function handle(client, ws, packet) { // eslint-disable-line complexity
  switch (packet.t) {
    case 'READY':
      for (const guild of packet.d.guilds) handle(client, ws, { t: 'GUILD_CREATE', d: guild });
      return packet.d;
    case 'RESUMED':
      return packet.d;
    case 'GUILD_CREATE':
      if (!packet.d.unavailable) client.guilds.size++;
      break;
    // case 'GUILD_UPDATE': {}
    case 'GUILD_DELETE':
      if (!packet.d.unavailable) client.guilds.size--;
      break;
    case 'CHANNEL_CREATE': {
      const channel = client.channels[packet.d.id];
      if (channel) return;
      if ([2, 4].includes(packet.d.type)) return;
      return client.channels[packet.d.id] = {
        id: packet.d.id,
        name: packet.d.name,
        type: packet.d.type,
        nsfw: packet.d.nsfw || /^nsfw(-|$)/.test(packet.d.name) || false,
        recipients: packet.d.recipients,
        last_message_id: packet.d.last_message_id,
        get guild() { return client.guilds[packet.d.guild_id]; },
      };
    }
    case 'CHANNEL_UPDATE': {
      const channel = client.channels[packet.d.id];
      if (!channel) return;
      const n = packet.d;
      if (Reflect.has(n, 'name')) channel.name = n.name;
      if (Reflect.has(n, 'nsfw')) channel.nsfw = n.nsfw; // eslint-disable-line eqeqeq
      if (Reflect.has(n, 'recipients')) channel.recipients = n.recipients;
      return channel;
    }
    case 'CHANNEL_DELETE': {
      const channel = client.channels[packet.d.id];
      if (!channel) return;
      delete client.channels[packet.d.id];
      return channel;
    }
    case 'MESSAGE_CREATE':
      return new Message(client, packet.d);
    default:
      return false;
  }
}

module.exports = handle;
