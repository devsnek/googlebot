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
      size: 0,
    };
    this.channels = {
      get size() { return Object.keys(this).length; },
    };

    this.event_counter = new EventCounter();

    this.shard_statuses = [];

    this.raven = require('../util/raven');
  }

  get unavailable() {
    let unavailable = 0;
    for (const g of Object.values(this.guilds)) if (g.unavailable) unavailable++;
    return unavailable / this.guilds.size;
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
      for (let i = 0; i < this.shard_count; i++) this.set_shard_status(i, -1);
      this.emit('CONNECTING', this.shard_count);
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
      this.set_shard_status(shard_id, 1);
      const handlePacket = (packet) => {
        if (packet.t) this.emit(packet.t, packet.d, packet.shard_id);
        if (packet.t === 'READY') {
          setTimeout(() => this.spawn(), 5e3);
          this.set_shard_status(shard_id, 0);
        } else if (packet.t === 'RESUMED') {
          this.set_shard_status(shard_id, 0);
        }
      };
      const handleRaw = (packet) => {
        this.event_counter.trigger(packet.t ? packet.t : `OP_${packet.op}`);
      };
      const handleDisconnect = () => {
        this.set_shard_status(shard_id, 2);
        // shard.removeListener('packet', handlePacket);
        // shard.removeListener('raw', handleRaw);
        setTimeout(() => this.spawn(), 5e3);
      };
      shard.on('packet', handlePacket);
      shard.on('raw', handleRaw);
      shard.once('disconnect', handleDisconnect);
      shard.connect(this.gateway);
    }
  }

  set_shard_status(id, status) {
    this.emit('SHARD_STATUS', id, status);
    this.shard_statuses[id] = status;
  }
}

module.exports = Client;
