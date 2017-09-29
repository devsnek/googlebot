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

  reply(content, options = {}) {
    if (typeof content === 'string') options.content = content;
    else options = content;

    if (options.content && !options.code && options.bold !== false) options.content = `**${options.content}**`;
    if (options.code) options.content = `\`\`\`${options.code}\n${options.content}\n\`\`\``;

    return this.client.api.channels(this.channel_id).messages.post({
      data: options,
    });
  }

  toJSON() {
    const ret = Object.assign({}, this);
    ret.client = undefined;
    ret.channel = this.channel ? {
      id: this.channel.id,
      name: this.channel.name,
      nsfw: this.channel.nsfw,
      type: this.channel.type,
    } : { id: this.channel_id };
    ret.channel.guild = this.channel && this.channel.guild ? {
      id: this.channel.guild.id,
      name: this.channel.guild.name,
    } : null;
    return ret;
  }
}

module.exports = Message;
