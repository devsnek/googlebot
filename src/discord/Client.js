const EventEmitter = require('events');
const WebSocketConnection = require('./WebSocketConnection');
const Router = require('./rest/Router');
const EventCounter = require('../util/EventCounter');
const logger = require('../util/Logger');

class Client extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;

    this.token = null;

    this.shard_queue = [];
    this.shard_count = null;

    this.rest = new Router(this);

    this.guilds = {
      get size() { return Object.keys(this).length; },
    };
    this.channels = {
      get size() { return Object.keys(this).length; },
    };

    this.eventCounter = new EventCounter();
  }

  get api() {
    return this.rest.api();
  }

  login(token) {
    this.token = token;
    return this.api.gateway.bot.get().then((res) => {
      this.gateway = res.url;
      this.shard_queue.push(...Array.from({ length: res.shards }, (_, i) => i));
      this.shard_count = res.shards;
      this.spawn();
    });
  }

  spawn(id) {
    if (id) {
      if (!this.shard_queue.includes(id)) this.shard_queue.push(id);
      if (this.shard_queue.length > 1) return;
    }
    const shard_id = this.shard_queue.shift();
    if (shard_id == null) return; // eslint-disable-line eqeqeq
    if (shard_id.options) {
      logger.log('RESPAWNING', shard_id.options.shard_id);
    } else {
      logger.log('SPAWNING', shard_id);
    }
    if (shard_id instanceof WebSocketConnection) {
      shard_id.connect();
    } else {
      const shard = new WebSocketConnection(this, {
        shard_id,
        shard_count: this.shard_count,
      });
      const handlePacket = (packet) => {
        if (packet.t) this.emit(packet.t, packet.d, packet.shard_id);
        if (packet.t === 'READY') setTimeout(() => this.spawn(), 5e3);
      };
      const handleRaw = (packet) => {
        this.eventCounter.trigger(packet.t ? packet.t : `OP_${packet.op}`);
      };
      const handleDisconnect = () => {
        shard.removeListener('packet', handlePacket);
        shard.removeListener('raw', handleRaw);
        setTimeout(() => this.spawn(), 5e3);
      };
      shard.on('packet', handlePacket);
      shard.on('raw', handleRaw);
      shard.once('disconnect', handleDisconnect);
      shard.connect(this.gateway);
    }
  }
}

module.exports = Client;
