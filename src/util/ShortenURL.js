const superagent = require('superagent');

module.exports = (key) => async (url) => {
  const uri = `https://www.googleapis.com/urlshortener/v1/url?key=${key}`;
  const res = await superagent.post(uri).set({'Content-Type': 'application/json'}).send({'longUrl': url});
  return res.body.id;
}
