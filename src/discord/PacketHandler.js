const Message = require('./structures/Message');

function handle(client, ws, packet) {
  switch (packet.t) {
    case 'READY':
      return packet.d;
    case 'GUILD_CREATE':
      if (packet.d.unavailable) return client.guilds[packet.d.id] = packet.d;
      for (const channel of packet.d.channels) {
        channel.guild_id = packet.d.id;
        handle(client, ws, { t: 'CHANNEL_CREATE', d: channel });
      }
      return client.guilds[packet.d.id] = {
        id: packet.d.id,
        name: packet.d.name,
        get channels() {
          return client.channels.filter((c) => c.guild.id === packet.d.id);
        },
        members: packet.d.members
          .reduce((o, m) => {
            if (m.nick) o[m.user.id] = { nick: m.nick };
            return o;
          }, {}),
        shard_id: ws.options.shard_id,
      };
    case 'GUILD_UPDATE': {
      const guild = client.guilds[packet.d.id];
      if (!guild) return;
      const n = packet.d;
      if (n.name) guild.name = n.name;
      return guild;
    }
    case 'GUILD_DELETE': {
      const guild = client.guilds[packet.d.id];
      if (!guild) return;
      delete client.guilds[packet.d.id];
      return guild;
    }
    case 'GUILD_MEMBER_UPDATE': {
      const guild = client.guilds[packet.d.guild_id];
      if (!guild) return;
      const member = guild.members[packet.d.user.id];
      if (!member) return;
      member.nick = packet.d.nick;
      return member;
    }
    case 'GUILD_MEMBER_ADD': {
      const guild = client.guilds[packet.d.guild_id];
      if (!guild) return;
      return guild.members[packet.d.user.id] = { nick: packet.d.nick };
    }
    case 'GUILD_MEMBER_REMOVE': {
      const guild = client.guilds[packet.d.guild_id];
      if (!guild) return;
      const member = guild.members[packet.d.user.id];
      delete guild.members[packet.d.user.id];
      return member;
    }
    case 'CHANNEL_CREATE': {
      const channel = client.channels[packet.d.id];
      if (channel) return;
      if ([2, 4].includes(packet.d.type)) return;
      return client.channels[packet.d.id] = {
        id: packet.d.id,
        name: packet.d.name,
        type: packet.d.type,
        recipients: packet.d.recipients,
        get guild() { return client.guilds[packet.d.guild_id]; },
      };
    }
    case 'CHANNEL_UPDATE': {
      const channel = client.channels[packet.d.id];
      if (!channel) return;
      const n = packet.d;
      if (n.name) channel.name = n.name;
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
