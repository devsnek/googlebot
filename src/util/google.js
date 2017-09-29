const request = require('snekfetch');
const cheerio = require('cheerio');
const xpath = require('xpath');
const DOM = require('xmldom').DOMParser;

const UA = 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) Gecko/20100101 Firefox/53.0';

let setCookie = [];
function req(url) {
  return request.get(url)
    .set({
      Accept: 'text/html, text/plain, text/sgml, text/css, application/xhtml+xml, */*;q=0.01',
      'Accept-Encoding': 'gzip, compress, bzip2',
      'Accept-Language': 'en',
      'User-Agent': 'Lynx/2.8.8rel.2 libwww-FM/2.14 SSL-MM/1.4.1 OpenSSL/1.0.2l',
      get 'Set-Cookie'() { return setCookie; },
    })
    .then((res) => {
      setCookie = res.headers['set-cookie'];
      // if (agent && agent.encryptedSocket) agent.encryptedSocket.end();
      return res.text;
    });
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

async function search(query, nsfw) {
  const params = {
    q: query,
    safe: nsfw ? 'off' : 'on',
    lr: 'lang_en',
    hl: 'en',
  };
  const headers = { 'User-Agent': UA };
  const res = await request.get('https://www.google.com/search')
    .query(params)
    .set(headers);

  let card;
  let results = [];
  if (res.status !== 200) return { card, results };

  const root = new DOM({ errorHandler: () => {} }).parseFromString(res.text); // eslint-disable-line no-empty-function

  // eslint-disable-next-line max-len
  const cardNode = xpath.select(`.//div[@id='rso']/div[@class='_NId']//div[contains(@class, 'vk_c') or @class='g mnr-c g-blk' or @class='kp-blk']`, root);
  const entries = xpath.select(`.//div[@class='rc']`, root);

  if (cardNode.length) card = parseGoogleCard(cardNode[0]);

  for (const node of entries) {
    const link = xpath.select("./h3[@class='r']/a", node)[0];
    results.push({
      text: link.firstChild.data,
      link: link.getAttribute('href'),
    });
  }
  return { card, results };
}

function parseGoogleCard(node) {
  const calculator = xpath.select(`.//span[@class='cwclet']`, node)[0];
  if (calculator) {
    const query = xpath.select(`.//span[@id='cwles']/text()`, node)[0];
    const answer = xpath.select(`.//span[@id='cwos']/text()`, node)[0];
    return `${query.data.trim()} ${answer.data.trim()}`.replace('=', 'equals');
  }

  const unitConversions = xpath.select(`.//input[contains(@class, '_eif') and @value]`, node);
  if (unitConversions.length === 2) {
    const [firstValue, secondValue] = unitConversions.map((n) => n.getAttribute('value'));
    const unitSelector = `parent::div/select/option[@selected='1']/text()`;
    const [firstUnit, secondUnit] = unitConversions.map((n) => xpath.select(unitSelector, n)[0]);
    return `${firstValue} ${firstUnit} = ${secondValue} ${secondUnit}`;
  }

  if (node.getAttribute('class').includes('currency')) {
    const currencySelectors = xpath.select(`.//div[@class='ccw_unit_selector_cnt']`, node);
    if (currencySelectors.length === 2) {
      const first = xpath.select(`.//div[@class='vk_sh vk_gy cursrc']/text()`, node)[0];
      const second = xpath.select(`.//div[@class='vk_ans vk_bk curtgt']/text()`, node)[0];
      return `${first} ${second}`;
    }
  }

  const time = xpath.select(`.//div[contains(@class, 'vk_bk vk_ans')]/text()`, node)[0];
  if (time) {
    const location = xpath.select('.//span[not(@class)]/text()', node)[0].data.trim();
    return `It is ${time.data.trim()} in ${location}`;
  }
}

module.exports = { search, image };
