function wrapMessage(client, packet) {
  return Object.assign(packet, {
    reply(options) {
      if (typeof options === 'string') options = { content: options };
      return client.api.channels(packet.channel_id).messages.post({
        data: options,
      });
    },
    timestamp: new Date(packet.timestamp).getTime(),
  });
}

module.exports = wrapMessage;
