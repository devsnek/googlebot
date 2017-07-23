const EventEmitter = require('events');
const WebSocketConnection = require('./WebSocketConnection');
const router = require('./Router');

class Client extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;

    this.token = null;
  }

  get api() {
    return router(this);
  }

  login(token) {
    this.token = token;
    return this.api.gateway.bot.get().then((res) => {
      console.log(res);
    });
  }
}

module.exports = Client;
