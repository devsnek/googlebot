const request = require('snekfetch');
const cheerio = require('cheerio');
const logger = require('./Logger');

let setCookie = [];
const HEADERS = {
  Accept: 'text/html, text/plain, text/sgml, text/css, application/xhtml+xml, */*;q=0.01',
  'Accept-Encoding': 'gzip, compress, bzip2',
  'Accept-Language': 'en',
  'User-Agent': 'Lynx/2.8.8rel.2 libwww-FM/2.14 SSL-MM/1.4.1 OpenSSL/1.0.2l',
  get 'Set-Cookie'() { return setCookie; },
};

// let setCookie;
function req(url) {
  return request.get(url)
    .set(HEADERS)
    .then((res) => {
      setCookie = res.headers['set-cookie'];
      return res.text;
    });
}

function search(query, nsfw = false) {
  // eslint-disable-next-line max-len
  return req(`https://www.google.com/search?ie=ISO-8859-1&hl=en&source=hp&q=${query}&btnG=Google+Search&gbv=1&safe=${nsfw ? 'disabled' : 'active'}`)
    .then((body) => cheerio.load(body))
    .then(function findInBody($) {
      const element = $('body p a').first();
      if (!element) return false;
      let href = element.attr('href');
      if (!href) return false;
      href = href.replace(/^\/url\?q=/, '');
      href = href.slice(0, href.indexOf('&sa='));
      if (href.startsWith('/')) {
        $('body p a').first().remove();
        return findInBody($);
      }
      return decodeURIComponent(href);
    })
    .catch(() => false);
}

function image(query, nsfw = false) {
  // eslint-disable-next-line max-len
  return req(`https://www.google.com/search?ie=ISO-8859-1&hl=en&source=hp&tbm=isch&gbv=1&gs_l=img&q=${query}&safe=${nsfw ? 'disabled' : 'active'}`)
    .then((body) => cheerio.load(body))
    .then(function findInBody($) {
      const element = $('td a img').first();
      if (!element) return false;
      const src = element.attr('src');
      if (!src) return false;
      if (src.startsWith('/')) {
        $('td a img').first().remove();
        return findInBody($);
      }
      return decodeURIComponent(src);
    })
    .catch(() => false);
}

module.exports = { search, image };
