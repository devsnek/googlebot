const superagent = require('superagent');
const key = require('../../config.json').google.shortenKey

module.exports = (url) => superagent.post(`https://www.googleapis.com/urlshortener/v1/url?key=${key}`)
    .set({'Content-Type': 'application/json'})
    .send({'longUrl': url})
    .then(res => res.body.id);
