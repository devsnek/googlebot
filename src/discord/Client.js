const EventEmitter = require('events');
const WebSocketConnection = require('./WebSocketConnection');
const router = require('./Router');

class Client extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;

    this.token = null;

    this.shard_queue = [];
  }

  get api() {
    return router(this);
  }

  login(token) {
    this.token = token;
    return this.api.gateway.bot.get().then((res) => {
      this.shard_queue.push(...Array.from({ length: res.shards }, (_, i) => i));
      (function loop() {
        const shard_id = this.shard_queue.shift();
        if (shard_id == null) return;
        const shard = new WebSocketConnection(this, {
          shard_id,
          shard_count: res.shards,
        });
        shard.on('packet', (packet) => {
          if (packet.t) this.emit(packet.t, packet.d, packet.shard_id);
          if (packet.t === 'READY') setTimeout(loop.bind(this), 5e3);
        });
        shard.connect(res.url);
      }.bind(this)());
    });
  }
}

module.exports = Client;
