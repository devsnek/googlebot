const express = require('express');
const router = express.Router();
const r = require('../../util/rethink');
const superagent = require('superagent');
const entities = new require('html-entities').XmlEntities; // eslint-disable-line
const marked = require('marked');

router.use(async (req, res, next) => {
  const quote = await superagent.get('http://quotesondesign.com/wp-json/posts?filter[orderby]=rand');
  res.locals.quote = entities.decode(quote.body[0].content).replace(/<\/?p>/g, '');
  return next();
});

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/help', async (req, res) => {
  res.locals.commands = await r.raw.db('google').table('commands').run();
  let compliance = await superagent.get('https://raw.githubusercontent.com/Roadcrosser/Compliance/master/enduser.md');
  res.locals.compliance = marked(compliance.text.replace('**- for end users**\n', ''));
  res.render('help');
});

router.get('/logout', (req, res) => {
  res.redirect('/panel/logout');
});

router.get('/login', (req, res) => {
  res.redirect('/panel/login');
});

module.exports = router;
