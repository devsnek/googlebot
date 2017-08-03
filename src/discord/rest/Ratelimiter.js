require('promise_util');
const request = require('./APIRequest');
const logger = require('../../util/Logger');

class Ratelimiter {
  constructor(client) {
    this.client = client;
    this.routes = {};
    this.global = false;
  }

  handle(route) {
    if (this.global || route.remaining <= 0 || route.queue.length <= 0 || route.busy) return;
    const item = route.queue.shift();
    route.busy = true;
    item.request().end((err, res) => {
      if (res && res.headers) {
        if (res.headers['x-ratelimit-global']) this.global = true;
        route.limit = Number(res.headers['x-ratelimit-limit']);
        route.resetTime = Number(res.headers['x-ratelimit-reset']) * 1000;
        route.remaining = Number(res.headers['x-ratelimit-remaining']);
        route.timeDifference = Date.now() - new Date(res.headers.date).getTime();
      }
      if (err) {
        if (err.status === 429) {
          route.queue.unshift(item);
          setTimeout(() => {
            route.busy = false;
            this.global = false;
            this.handle(route);
          }, route.resetTime - Date.now() + route.timeDifference);
        } else if (err.status === 500) {
          route.queue.unshift(item);
          setTimeout(() => {
            route.busy = false;
            this.handle(route);
          }, 1e3);
        } else {
          item.promise.reject(err);
          route.busy = false;
          this.handle(route);
        }
      } else {
        const data = res && res.body ? res.body : {};
        item.promise.resolve(data);
        if (route.remaining <= 0) {
          setTimeout(() => {
            route.busy = false;
            route.remaining = 1;
            this.handle(route);
          }, route.resetTime - Date.now() + route.timeDifference);
        } else {
          route.busy = false;
          this.handle(route);
        }
      }
    });
  }

  queue(method, path, options) {
    const p = Promise.create();
    if (!this.routes[options.route]) {
      this.routes[options.route] = {
        queue: [],
        remaining: 1,
        resetTime: null,
        limit: Infinity,
        timeDifference: 0,
        busy: false,
      };
    }
    this.routes[options.route].queue.push({
      request: request(this.client, method, path, options),
      promise: p,
    });
    this.handle(this.routes[options.route]);
    p.catch((err) => logger.error('API REQUEST', err.stack));
    return p;
  }
}

module.exports = Ratelimiter;
