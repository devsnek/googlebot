const request = require('snekfetch');
const cheerio = require('cheerio');

const UA = 'Lynx/2.8.6rel.4 libwww-FM/2.14 SSL-MM/1.4.1 OpenSSL/0.9.8g';

let setCookie = null;
function req(url) {
  return request.get(url)
    .set({
      'Set-Cookie': setCookie,
      Referrer: 'https://www.google.com/',
      'User-Agent': UA,
    })
    .then((res) => {
      setCookie = res.headers['set-cookie'];
      return res.text;
    });
}

function search(query, nsfw = false) {
  // eslint-disable-next-line max-len
  return req(`https://www.google.com/search?ie=ISO-8859-1&hl=en&source=hp&q=${query}&btnG=Google+Search&gbv=1&safe=${nsfw ? 'disabled' : 'active'}`)
    .then((body) => cheerio.load(body))
    .then(($) => {
      const element = $('body p a').first();
      if (!element) return false;
      let href = element.attr('href');
      if (!href) return false;
      href = href.replace(/^\/url\?q=/, '');
      href = href.slice(0, href.indexOf('&sa='));
      return href;
    })
    .catch(() => false);
}

module.exports = { search };
