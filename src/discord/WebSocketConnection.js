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
    let packet;
    try {
      packet = erlpack.unpack(Buffer.from(data));
    } catch (err) {
      return;
    }

    if (packet.s) this.cache.seq = packet.s;

    if (packet.t === 'READY') {
      this.cache.session_id = packet.d.session_id;
    } else if (packet.op === 10) {
      this.identify();
      this.heartbeat = setInterval(() => {
        this.send(1, this.cache.seq);
      }, packet.d.heartbeat_interval);
    } else if (packet.op === 1) {
      this.send(1, this.cache.seq);
    } else if (packet.op === 9) {
      logger.log('SESSION INVALIDATION', this.options.shard_id);
      this.cache.session_id = null;
      this.client.spawn(this.identify.bind(this));
    }

    const handled = handle(this.client, this, packet);
    if (this.listenerCount('raw')) this.emit('raw', packet);
    if (handled) {
      this.emit('packet', {
        t: packet.t,
        d: handled,
        shard_id: this.options.shard_id,
      });
    }
  }

  onOpen() {} // eslint-disable-line no-empty-function

  onError(e) {
    logger.log('CONNECTION ERROR', this.options.shard_id, e.reason || e.message, e.code);
    if (![WebSocket.CLOSED, WebSocket.CLOSING].includes(this.ws.readyState)) this.ws.close();
    if (this.cache.session_id) setTimeout(() => this.connect(), 500);
    else this.client.spawn(this.connect.bind(this));
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
    ws.onmessage = this.onMessage.bind(this);
    ws.onopen = this.onOpen.bind(this);
    ws.onclose = ws.onerror = this.onError.bind(this);
  }
}

module.exports = WebSocketConnection;
