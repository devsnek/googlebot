const r = require('rethinkdb');

module.exports = (guildId, dbconn) => {
  return new Promise((resolve, reject) => {
    r.db('google').table('servers').get(guildId).run(dbconn, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}
