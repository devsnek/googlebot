const request = require('./APIRequest');

class Ratelimiter {
  constructor(client) {
    this.client = client;
  }

  queue(...args) {
    return request(this.client, ...args);
  }
}

module.exports = Ratelimiter;
