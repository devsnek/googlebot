const superagent = require('superagent');

module.exports = (client) => {
  return (id, content) => {
    return new Promise((resolve, reject) => {
      superagent.post(`https://discordapp.com/api/channels/${id}/messages`)
      .set('Authorization', `Bot ${client.token}`).send({ content })
      .end((err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  }
}
