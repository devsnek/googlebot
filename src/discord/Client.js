const EventEmitter = require('events');
const WebSocketConnection = require('./WebSocketConnection');
const Router = require('./rest/Router');

class Client extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;

    this.token = null;

    this.shard_queue = [];

    this.rest = new Router(this);

    this.guilds = {
      get size() { return Object.keys(this).length; },
    };
    this.channels = {
      get size() { return Object.keys(this).length; },
    };
  }

  get api() {
    return this.rest.api();
  }

  login(token) {
    this.token = token;
    return this.api.gateway.bot.get().then((res) => {
      this.gateway = res.url;
      this.shard_queue.push(...Array.from({ length: res.shards }, (_, i) => i));
      this.shard_queue.shard_count = res.shards;
      this.spawn();
    });
  }

  spawn(id) {
    if (id) {
      this.shard_queue.push(id);
      if (this.hard_queue.length === 1) return;
    }
    const shard_id = this.shard_queue.shift();
    if (shard_id == null) return; // eslint-disable-line eqeqeq
    if (typeof shard_id === 'function') {
      shard_id();
    } else {
      const shard = new WebSocketConnection(this, {
        shard_id,
        shard_count: this.shard_queue.shard_count,
      });
      shard.on('packet', (packet) => {
        if (packet.t) this.emit(packet.t, packet.d, packet.shard_id);
        if (packet.t === 'READY') setTimeout(this.spawn.bind(this), 5e3);
      });
      shard.connect(this.gateway);
    }
  }
}

module.exports = Client;
