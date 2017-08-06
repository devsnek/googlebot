const ua = require('universal-analytics');
const config = require('../../config.json');

const users = new Map();

function track(id, { command, event }) {
  let visitor;
  if (!users.has(id)) {
    visitor = ua(config.ua, id).debug();
    users.set(id, visitor);
  } else {
    visitor = users.get(id);
  }
  let head = command ? visitor.pageview(`/${command}`) : visitor;
  if (event) head = head.event('event', event);
  head.send();
}

module.exports = track;
module.exports.users = users;
