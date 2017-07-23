class Message {
  constructor(client, packet) {
    this.client = client;

    this.patch(packet);
  }

  patch(packet) {
    Object.assign(this, packet);
    this.channel = this.client.channels[packet.channel_id];
  }

  get createdAt() {
    return new Date(this.timestamp);
  }

  get editedAt() {
    return new Date(this.editedTimestamp);
  }

  reply(options) {
    if (typeof options === 'string') options = { content: options };
    return this.client.api.channels(this.channel_id).messages.post({
      data: options,
    });
  }
}

module.exports = Message;
