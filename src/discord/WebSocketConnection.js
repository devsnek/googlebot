const EventEmitter = require('events');
const Package = require('../../package.json');
const WebSocket = require('uws');
const erlpack = require('erlpack');

class WebSocketConnection extends EventEmitter {
  constructor(client, options = {}) {
    super();
    this.client = client;
    this.options = options;

    this.cache = {
      seq: 0,
      session_id: null,
      get token() {
        return client.token;
      }
    };
  }

  send(op, d) {
    return this.ws.send(erlpack.pack({ op, d }));
  }

  onOpen() {}

  onMessage({ data }) {
    let packet;
    try {
      packet = erlpack.unpack(data);
    } catch (err) {
      return;
    }

    console.log(packet);
  }

  onError() {}

  identify() {
    const uniq = `${Package.name}/${Package.version}`;
    this.send(Constants.OpCodes.IDENTIFY, {
      token: this.client.token,
      shard: [this.options.shardId, this.options.shardCount],
      large_threshold: 150,
      compress: true,
      properties: {
        $os: process.platform,
        $browser: uniq,
        $device: uniq,
        $referrer: '',
        $referring_domain: ''
      },
    });
  }

  connect(gateway) {
    const ws = this.ws = new WebSocket(`${gateway}/?v=6&encoding=etf`);
    ws.onmessage = this.onMessage.bind(this);
    ws.onopen = this.onOpen.bind(this);
    ws.onclose = ws.onerror = this.onError.bind(this);
  }
}

module.exports = WebSocketConnection;
