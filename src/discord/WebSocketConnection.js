const WebSocket = require('uws');
const erlpack = require('erlpack');
const EventEmitter = require('events');
const Package = require('../../package.json');
const handle = require('./PacketHandler');
const logger = require('../util/Logger');

class WebSocketConnection extends EventEmitter {
  constructor(client, options) {
    super();
    this.client = client;
    this.options = options;

    this.gateway = null;

    this.cache = {
      seq: 0,
      session_id: null,
      get token() { return client.token; },
    };

    this.heartbeat = null;
  }

  send(op, d) {
    return this.ws.send(erlpack.pack({ op, d }));
  }

  onMessage({ data }) {
    if (Array.isArray(data)) data = Buffer.concat(data);
    let packet;
    try {
      packet = erlpack.unpack(Buffer.from(data));
    } catch (err) {
      return;
    }

    if (packet.s > this.cache.seq) this.cache.seq = packet.s;

    if (packet.t === 'READY') {
      logger.log('READY', this.options.shard_id);
      this.cache.session_id = packet.d.session_id;
    } else if (packet.t === 'RESUMED') {
      logger.log('RESUMED', this.options.shard_id);
    } else if (packet.op === 10) {
      this.identify();
      this.heartbeat = setInterval(() => {
        this.send(1, this.cache.seq);
      }, packet.d.heartbeat_interval);
    } else if (packet.op === 1) {
      this.send(1, this.cache.seq);
    } else if (packet.op === 7) {
      logger.log('RECONNECTING', this.options.shard_id);
      this.reconnect();
    } else if (packet.op === 9) {
      logger.log('SESSION INVALIDATION', this.options.shard_id);
      if (packet.d === false) {
        this.cache.session_id = null;
        setTimeout(() => this.client.spawn(this), 2e3);
      } else {
        setTimeout(() => this.connect(), 2e3);
      }
    }

    if (this.listenerCount('raw')) this.emit('raw', packet);
    const handled = handle(this.client, this, packet);
    if (handled) {
      this.emit('packet', {
        t: packet.t,
        d: handled,
        shard_id: this.options.shard_id,
      });
    }
  }

  onOpen() {} // eslint-disable-line no-empty-function

  onClose(e) {
    if (!e.code) return; // fuck you uWS
    logger.log('CONNECTION CLOSE', this.options.shard_id, e.reason, e.code);
    this.emit('disconnect');
    this.reconnect();
  }

  onError(e) {
    logger.log('CONNECTION ERROR', this.options.shard_id, e.message);
  }

  reconnect() {
    if (![WebSocket.CLOSED, WebSocket.CLOSING].includes(this.ws.readyState)) this.ws.close();
    if (this.cache.session_id) setTimeout(() => this.connect(), 500);
    else this.client.spawn(this);
  }

  identify() {
    if (this.cache.session_id) {
      logger.log('RESUME', this.options.shard_id);
      this.send(6, this.cache);
    } else {
      logger.log('IDENTIFY', this.options.shard_id);
      const uniq = `${Package.name}/${Package.version}`;
      const d = {
        token: this.client.token,
        shard: [this.options.shard_id, this.options.shard_count],
        large_threshold: 150,
        compress: true,
        properties: {
          $os: uniq,
          $browser: uniq,
          $device: uniq,
        },
      };
      if (this.client.options.presence) {
        d.presence = this.client.options.presence(this.options.shard_id);
      }
      this.send(2, d);
    }
  }

  connect(gateway = this.client.gateway) {
    const ws = this.ws = new WebSocket(`${gateway}/?v=6&encoding=etf`);
    ws.onclose = this.onClose.bind(this);
    ws.onerror = this.onError.bind(this);
    ws.onmessage = this.onMessage.bind(this);
    ws.onopen = this.onOpen.bind(this);
  }
}

module.exports = WebSocketConnection;
