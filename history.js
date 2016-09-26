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

  push(value) {
    this.data.values.push(value);
    this.data.times.push(moment().format('HH:MM:SS'));
    this.data.values.slice(this.options.count);
    this.data.times.slice(this.options.count);
  }
}

module.exports = History;
