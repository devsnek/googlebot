const WebSocket = require('uws');
const erlpack = require('erlpack');
const EventEmitter = require('events');
const Constants = require('../Constants');
const Package = require('../../package.json');
const handle = require('./PacketHandler');

class WebSocketConnection extends EventEmitter {
  constructor(client, options) {
    super();
    this.client = client;
    this.options = options;

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
      this.cache.session_id = null;
      setTimeout(() => this.identify(), 1e3);
    }

    handle(this.client, this, packet);
    if (this.listenerCount('raw')) this.emit('raw', packet);
    const handled = handle(this.client, this, packet);
    if (handled) this.emit('packet', {
      t: packet.t,
      d: handled,
      shard_id: this.options.shard_id,
    });
  }

  onOpen() {}

  onError() {}

  identify() {
    if (this.cache.session_id) {
      send(6, this.cache);
    } else {
      const uniq = `${Package.name}/${Package.version}`;
      const d = {
        token: this.client.token,
        shard: [this.options.shard_id, this.options.shard_count],
        large_threshold: 150,
        compress: true,
        properties: {
          $os: process.platform,
          $browser: uniq,
          $device: uniq,
          $referrer: '',
          $referring_domain: ''
        },
      };
      if (this.client.options.presence) {
        d.presence = this.client.options.presence(this.options.shard_id);
      }
      this.send(2, d);
    }
  }

  connect(gateway) {
    const ws = this.ws = new WebSocket(`${gateway}/?v=6&encoding=etf`);
    ws.onmessage = this.onMessage.bind(this);
    ws.onopen = this.onOpen.bind(this);
    ws.onclose = ws.onerror = this.onError.bind(this);
  }
}

module.exports = WebSocketConnection;
