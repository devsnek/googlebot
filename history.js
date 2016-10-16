const moment = require('moment');

const merge = (def, given) => {
  if (!given) return def;
  for (const key in def) {
    if (!{}.hasOwnProperty.call(given, key)) {
      given[key] = def[key];
    } else if (given[key] === Object(given[key])) {
      given[key] = merge(def[key], given[key]);
    }
  }
  return given;
};

class History {
  constructor (options) {
    this.options = merge({count: 20}, options);
    this.data = {
      times: [],
      values: []
    }
  }

  push (value) {
    this.data.values.push(value);
    this.data.times.push(moment().format('HH:MM:SS'));
    this.data.values = this.data.values.slice(Math.max(this.data.values.length - this.options.count, 0))
    this.data.times = this.data.times.slice(Math.max(this.data.times.length - this.options.count, 0))
  }

  get values () {
    return this.data;
  }
}

module.exports = History;
